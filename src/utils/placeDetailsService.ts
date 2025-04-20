
// Utility for fetching place details from Google Maps Places API

// Types for place details response
export interface PlacePhoto {
  photoReference: string;
  width: number;
  height: number;
  htmlAttributions: string[];
  url?: string; // Generated URL for frontend display
}

export interface PlaceOpeningHours {
  isOpen: boolean;
  weekdayText: string[];
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  formattedPhoneNumber?: string;
  internationalPhoneNumber?: string;
  website?: string;
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  types?: string[];
  vicinity?: string;
  photos?: PlacePhoto[];
  openingHours?: PlaceOpeningHours;
  location: {
    lat: number;
    lng: number;
  };
  utcOffset?: number;
}

/**
 * Fetches detailed information about a place using Google Maps Places API
 * @param placeId - The ID of the place to fetch details for
 * @returns Promise with place details
 */
export const getPlaceDetails = (placeId: string): Promise<PlaceDetails> => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      reject(new Error('Google Maps Places API not loaded'));
      return;
    }

    // Create a temporary DOM element for the PlacesService
    const placesDiv = document.createElement('div');
    placesDiv.style.display = 'none';
    document.body.appendChild(placesDiv);
    
    const placesService = new window.google.maps.places.PlacesService(placesDiv);
    
    placesService.getDetails(
      {
        placeId,
        fields: [
          'name',
          'formatted_address',
          'formatted_phone_number',
          'international_phone_number',
          'website',
          'rating',
          'user_ratings_total',
          'price_level',
          'types',
          'vicinity',
          'photos',
          'opening_hours',
          'geometry',
          'utc_offset'
        ]
      },
      (place, status) => {
        // Clean up temporary element
        document.body.removeChild(placesDiv);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          // Process and format photos if available
          const photos: PlacePhoto[] = place.photos?.map(photo => {
            const photoObj: PlacePhoto = {
              photoReference: '', // This is not directly accessible from the JS API
              width: photo.width,
              height: photo.height,
              htmlAttributions: photo.html_attributions || [],
              url: photo.getUrl({ maxWidth: 800, maxHeight: 600 })
            };
            return photoObj;
          }) || [];
          
          // Format opening hours if available
          let openingHours: PlaceOpeningHours | undefined;
          if (place.opening_hours) {
            openingHours = {
              isOpen: place.opening_hours.isOpen?.() || false,
              weekdayText: place.opening_hours.weekday_text || []
            };
          }
          
          const placeDetails: PlaceDetails = {
            placeId,
            name: place.name || '',
            formattedAddress: place.formatted_address || '',
            formattedPhoneNumber: place.formatted_phone_number,
            internationalPhoneNumber: place.international_phone_number,
            website: place.website,
            rating: place.rating,
            userRatingsTotal: place.user_ratings_total,
            priceLevel: place.price_level,
            types: place.types,
            vicinity: place.vicinity,
            photos,
            openingHours,
            location: {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0
            },
            utcOffset: place.utc_offset
          };
          
          resolve(placeDetails);
        } else {
          reject(new Error(`Error fetching place details: ${status}`));
        }
      }
    );
  });
};

/**
 * Searches for nearby places of specific type
 * @param location - Latitude and longitude to search around
 * @param type - Type of place to search for (restaurant, lodging, etc.)
 * @param radius - Search radius in meters (default: 1000)
 * @returns Promise with nearby places
 */
export const getNearbyPlaces = (
  location: { lat: number; lng: number },
  type: string,
  radius: number = 1000
): Promise<PlaceDetails[]> => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      reject(new Error('Google Maps Places API not loaded'));
      return;
    }

    // Create a temporary DOM element for the PlacesService
    const placesDiv = document.createElement('div');
    placesDiv.style.display = 'none';
    document.body.appendChild(placesDiv);
    
    const placesService = new window.google.maps.places.PlacesService(placesDiv);
    const googleLocation = new window.google.maps.LatLng(location.lat, location.lng);
    
    placesService.nearbySearch(
      {
        location: googleLocation,
        radius,
        type
      },
      (results, status) => {
        // Clean up temporary element
        document.body.removeChild(placesDiv);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          // Convert to our PlaceDetails format
          const places: PlaceDetails[] = results.map(place => {
            const photos: PlacePhoto[] = place.photos?.map(photo => {
              return {
                photoReference: '',
                width: photo.width,
                height: photo.height,
                htmlAttributions: photo.html_attributions || [],
                url: photo.getUrl({ maxWidth: 800, maxHeight: 600 })
              };
            }) || [];
            
            return {
              placeId: place.place_id || '',
              name: place.name || '',
              formattedAddress: place.vicinity || '',
              rating: place.rating,
              userRatingsTotal: place.user_ratings_total,
              priceLevel: place.price_level,
              types: place.types,
              vicinity: place.vicinity,
              photos,
              location: {
                lat: place.geometry?.location?.lat() || 0,
                lng: place.geometry?.location?.lng() || 0
              }
            };
          });
          
          resolve(places);
        } else {
          reject(new Error(`Error fetching nearby places: ${status}`));
        }
      }
    );
  });
};

/**
 * Gets a photo URL from a photo reference
 * (This function builds a simple proxy URL for display in UI)
 */
export const getPhotoUrl = (photoReference: string, maxWidth: number = 400): string => {
  // This would normally require an API key, but we're returning the photo URLs directly 
  // from the JavaScript API in our implementation, so this is just a fallback
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=[YOUR_API_KEY]`;
};

/**
 * Gets directions between two points
 */
export const getDirections = (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<google.maps.DirectionsResult> => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps || !window.google.maps.DirectionsService) {
      reject(new Error('Google Maps API not loaded'));
      return;
    }
    
    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin: new window.google.maps.LatLng(origin.lat, origin.lng),
        destination: new window.google.maps.LatLng(destination.lat, destination.lng),
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          resolve(result);
        } else {
          reject(new Error(`Error fetching directions: ${status}`));
        }
      }
    );
  });
};
