
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationMapSelectorProps {
  onLocationSelect: (location: { 
    address: string; 
    placeId?: string; 
    coordinates: { lat: number; lng: number } 
  }) => void;
  currentLocation?: { lat: number; lng: number };
}

export function LocationMapSelector({ onLocationSelect, currentLocation }: LocationMapSelectorProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const { toast } = useToast();

  // Initialize map
  useEffect(() => {
    if (window.google && !map) {
      const defaultLocation = currentLocation || { lat: 27.1442, lng: 88.5614 }; // Default to Majhitar
      
      const mapInstance = new google.maps.Map(document.getElementById('map')!, {
        center: defaultLocation,
        zoom: 15,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false
      });

      const markerInstance = new google.maps.Marker({
        position: defaultLocation,
        map: mapInstance,
        draggable: true,
        animation: google.maps.Animation.DROP
      });

      mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
        const position = e.latLng;
        if (position && markerInstance) {
          markerInstance.setPosition(position);
          updateLocationFromMarker(position);
        }
      });

      markerInstance.addListener('dragend', () => {
        const position = markerInstance.getPosition();
        if (position) {
          updateLocationFromMarker(position);
        }
      });

      setMap(mapInstance);
      setMarker(markerInstance);

      if (currentLocation) {
        mapInstance.setCenter(currentLocation);
        markerInstance.setPosition(currentLocation);
      }
    }
  }, [window.google, currentLocation]);

  const updateLocationFromMarker = async (position: google.maps.LatLng) => {
    const geocoder = new google.maps.Geocoder();
    
    try {
      const response = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ location: position }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            resolve(results);
          } else {
            reject(new Error('Geocoding failed'));
          }
        });
      });

      const address = response[0].formatted_address;
      const placeId = response[0].place_id || `map_selected_${Date.now()}`;
      
      onLocationSelect({
        address,
        placeId,
        coordinates: {
          lat: position.lat(),
          lng: position.lng()
        }
      });

    } catch (error) {
      console.error('Error geocoding location:', error);
      // If geocoding fails, still provide coordinates with a generated placeId
      onLocationSelect({
        address: "Selected location",
        placeId: `map_selected_${Date.now()}`,
        coordinates: {
          lat: position.lat(),
          lng: position.lng()
        }
      });
      
      toast({
        title: "Error",
        description: "Could not get address for selected location",
        variant: "destructive",
      });
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          if (map && marker) {
            map.setCenter(pos);
            map.setZoom(15);
            marker.setPosition(pos);
            updateLocationFromMarker(new google.maps.LatLng(pos.lat, pos.lng));
          }
        },
        (error) => {
          toast({
            title: "Error",
            description: "Could not get your current location",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Select Location on Map</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGetCurrentLocation}
          className="flex items-center gap-2"
        >
          <Navigation className="h-4 w-4" />
          Use My Location
        </Button>
      </div>
      <div 
        id="map" 
        className="w-full h-[300px] rounded-md border border-gray-200"
        style={{ minHeight: "300px" }}
      />
      <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
        <MapPin className="h-4 w-4" />
        Click on the map or drag the marker to select a location
      </p>
    </Card>
  );
}
