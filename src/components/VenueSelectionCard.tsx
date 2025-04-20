
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GooglePlacesAutocomplete } from "@/components/GooglePlacesAutocomplete";
import { PlaceDetailsCard } from "@/components/PlaceDetailsCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getNearbyPlaces, PlaceDetails } from "@/utils/placeDetailsService";
import { Loader2, MapPin, Building } from "lucide-react";

interface VenueSelectionCardProps {
  value: string;
  placeId?: string;
  coordinates?: { lat: number; lng: number };
  onChange: (venue: { address: string; placeId: string; coordinates: { lat: number; lng: number } }) => void;
}

export function VenueSelectionCard({
  value,
  placeId,
  coordinates,
  onChange
}: VenueSelectionCardProps) {
  const [activeTab, setActiveTab] = useState<string>("search");
  const [nearbyVenues, setNearbyVenues] = useState<PlaceDetails[]>([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<PlaceDetails | null>(null);
  const { toast } = useToast();

  // Handle place selection from GooglePlacesAutocomplete
  const handlePlaceChange = (place: { 
    address: string; 
    placeId: string; 
    coordinates: { lat: number; lng: number } 
  } | null) => {
    if (place) {
      onChange(place);
      setSelectedVenue(null);
    }
  };

  // Fetch nearby venues when coordinates change
  useEffect(() => {
    if (coordinates && coordinates.lat && coordinates.lng && activeTab === "nearby") {
      fetchNearbyVenues();
    }
  }, [coordinates, activeTab]);

  // Fetch nearby venues
  const fetchNearbyVenues = async () => {
    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      setNearbyError("Please enter a location first to find nearby venues");
      return;
    }

    setIsLoadingNearby(true);
    setNearbyError(null);

    try {
      // Search for various venue types (sorted by relevance)
      const venueTypes = [
        "banquet_hall", "event_venue", "convention_center", 
        "restaurant", "hotel", "park", "tourist_attraction"
      ];
      
      // Start with the first type and a larger radius
      const venues = await getNearbyPlaces(
        coordinates,
        venueTypes[0],
        3000 // 3km radius
      );
      
      if (venues.length > 0) {
        setNearbyVenues(venues);
      } else {
        // If no results, try with a broader search
        const backupVenues = await getNearbyPlaces(
          coordinates,
          "point_of_interest",
          5000 // 5km radius
        );
        setNearbyVenues(backupVenues);
      }
    } catch (error) {
      console.error("Error fetching nearby venues:", error);
      setNearbyError("Could not load nearby venues. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to load nearby venues",
        variant: "destructive",
      });
    } finally {
      setIsLoadingNearby(false);
    }
  };

  // Handle selecting a venue from the nearby list
  const handleSelectVenue = (venue: PlaceDetails) => {
    setSelectedVenue(venue);
    onChange({
      address: venue.formattedAddress,
      placeId: venue.placeId,
      coordinates: venue.location
    });
    toast({
      title: "Venue Selected",
      description: `Selected ${venue.name}`,
    });
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building className="h-5 w-5 mr-2 text-party-500" />
          Event Venue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="search" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="search" className="flex-1">Search</TabsTrigger>
            <TabsTrigger 
              value="nearby" 
              className="flex-1"
              onClick={fetchNearbyVenues}
              disabled={!coordinates || !coordinates.lat}
            >
              Nearby Venues
            </TabsTrigger>
            {placeId && <TabsTrigger value="details" className="flex-1">Venue Details</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="search">
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Search for a venue by name, or enter the event location address
              </p>
              <GooglePlacesAutocomplete
                value={value}
                onChange={handlePlaceChange}
                placeholder="Search for venues or enter address"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="nearby">
            <div className="space-y-4">
              {isLoadingNearby ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-party-500 mr-2" />
                  <p>Finding venues near {value || "your location"}...</p>
                </div>
              ) : nearbyError ? (
                <div className="text-center py-6 text-amber-600">
                  <p>{nearbyError}</p>
                  {!coordinates && (
                    <p className="mt-2 text-sm text-gray-600">
                      Please enter a location in the search tab first
                    </p>
                  )}
                </div>
              ) : nearbyVenues.length === 0 ? (
                <div className="text-center py-6 text-gray-600">
                  <p>No venues found nearby. Try searching for a specific venue.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {nearbyVenues.map((venue) => (
                    <div 
                      key={venue.placeId}
                      className="border rounded-lg p-3 hover:border-party-300 cursor-pointer transition-all"
                      onClick={() => handleSelectVenue(venue)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{venue.name}</h4>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="line-clamp-1">{venue.vicinity}</span>
                          </div>
                        </div>
                        {venue.rating && (
                          <div className="flex items-center bg-amber-50 px-2 py-1 rounded">
                            <span className="text-amber-700 text-sm font-medium">{venue.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={fetchNearbyVenues}
                disabled={isLoadingNearby || !coordinates}
                className="mt-4 w-full"
              >
                {isLoadingNearby ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  "Refresh Nearby Venues"
                )}
              </Button>
            </div>
          </TabsContent>
          
          {placeId && (
            <TabsContent value="details">
              <PlaceDetailsCard placeId={placeId} />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
