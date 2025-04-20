
import { useRef, useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { Loader2, MapPin, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Place {
  address: string;
  placeId: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (place: Place | null) => void;
  onFocus?: () => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

// Default coordinates for Majhitar, East Sikkim, India
const DEFAULT_COORDINATES = {
  lat: 27.1442,
  lng: 88.5614
};

export function GooglePlacesAutocomplete({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder = "Enter location",
  className = "",
  id = "location-search"
}: GooglePlacesAutocompleteProps) {
  const { isLoaded, isLoading: isLoadingAPI, error: mapsError } = useGoogleMaps();
  const [inputValue, setInputValue] = useState(value || 'Majhitar, East Sikkim, India');
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
  
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const predictionsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize Google services when API is loaded
  useEffect(() => {
    if (isLoaded && window.google && window.google.maps) {
      try {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        geocoder.current = new window.google.maps.Geocoder();
        
        const placesDiv = document.createElement('div');
        placesDiv.style.display = 'none';
        document.body.appendChild(placesDiv);
        placesService.current = new window.google.maps.places.PlacesService(placesDiv);
      } catch (error) {
        console.error("Error initializing Google Maps services:", error);
      }
    }
  }, [isLoaded]);

  // If this is the initial load and we have a default value for Majhitar, notify the parent
  useEffect(() => {
    if (value === '' && inputValue === 'Majhitar, East Sikkim, India') {
      // Set default place on initial load
      onChange({
        address: 'Majhitar, East Sikkim, India',
        placeId: 'default_majhitar',
        coordinates: DEFAULT_COORDINATES
      });
    }
  }, []);

  // Update input value when prop value changes
  useEffect(() => {
    if (value && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  // Handle clicks outside to close predictions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        predictionsRef.current && 
        !predictionsRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowPredictions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get place details from place ID
  const getPlaceDetails = (placeId: string): Promise<Place> => {
    return new Promise((resolve, reject) => {
      if (!placesService.current) {
        // Fallback if Places service isn't available
        resolve({
          address: inputValue,
          placeId: 'fallback_' + Date.now(),
          coordinates: DEFAULT_COORDINATES
        });
        return;
      }

      placesService.current.getDetails(
        {
          placeId,
          fields: ['formatted_address', 'geometry', 'name']
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            resolve({
              address: place.formatted_address || place.name || inputValue,
              placeId,
              coordinates: {
                lat: place.geometry?.location?.lat() || DEFAULT_COORDINATES.lat,
                lng: place.geometry?.location?.lng() || DEFAULT_COORDINATES.lng,
              }
            });
          } else {
            // Fallback if we can't get details
            resolve({
              address: inputValue,
              placeId: 'fallback_' + Date.now(),
              coordinates: DEFAULT_COORDINATES
            });
          }
        }
      );
    });
  };

  // Fetch address predictions with India bias
  const fetchPredictions = async (input: string) => {
    if (!input || input.length < 2 || !autocompleteService.current || !isLoaded) {
      setPredictions([]);
      return;
    }

    setIsLoadingPredictions(true);
    try {
      const response = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve, reject) => {
        autocompleteService.current!.getPlacePredictions(
          { 
            input,
            componentRestrictions: { country: 'in' },
            // Bias towards North East India
            bounds: new google.maps.LatLngBounds(
              new google.maps.LatLng(26.0, 88.0),  // SW corner of NE India
              new google.maps.LatLng(28.0, 96.0)   // NE corner of NE India
            )
          },
          (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              resolve(predictions);
            } else {
              reject(new Error(`Error fetching predictions: ${status}`));
            }
          }
        );
      });
      setPredictions(response);
    } catch (error) {
      console.error("Error fetching predictions:", error);
      setPredictions([]);
    } finally {
      setIsLoadingPredictions(false);
    }
  };

  // Debounce predictions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoaded && inputValue.length > 2) {
        fetchPredictions(inputValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, isLoaded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowPredictions(true);
    if (!newValue) {
      onChange(null);
    }
  };

  const handlePredictionClick = async (prediction: google.maps.places.AutocompletePrediction) => {
    try {
      setIsLoadingPredictions(true);
      const place = await getPlaceDetails(prediction.place_id);
      setInputValue(place.address);
      onChange(place);
      setShowPredictions(false);
      toast({
        title: "Location selected",
        description: "Address successfully set",
      });
    } catch (error) {
      console.error("Error getting place details:", error);
      toast({
        title: "Error",
        description: "Failed to get location details",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPredictions(false);
    }
  };

  const handleClearInput = () => {
    setInputValue("");
    onChange(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleManualInput = () => {
    // If Google Maps fails, at least let users input an address manually
    if (inputValue.trim()) {
      onChange({
        address: inputValue,
        placeId: 'manual_' + Date.now(),
        coordinates: DEFAULT_COORDINATES
      });
      
      toast({
        title: "Location set",
        description: "Address set to " + inputValue,
      });
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // On blur, if maps service isn't available, use the manual input
    if (mapsError && inputValue) {
      handleManualInput();
    }
    
    if (onBlur) onBlur(e);
  };

  const renderLoadingState = useMemo(() => {
    if (isLoadingAPI) {
      return (
        <div className="flex items-center gap-2 p-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading location services...</span>
        </div>
      );
    }
    return null;
  }, [isLoadingAPI]);

  return (
    <div className="relative w-full">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            id={id}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setShowPredictions(inputValue.length > 0)}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            className={`pr-8 ${className}`}
            autoComplete="off"
            disabled={isLoadingAPI}
          />
          {inputValue && (
            <button
              type="button"
              onClick={handleClearInput}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear input"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {renderLoadingState}

      {/* If Google Maps failed to load, show a message */}
      {mapsError && !isLoadingAPI && (
        <div className="text-xs text-amber-600 mt-1 flex items-center">
          <span>Location services unavailable. You can still enter an address manually.</span>
        </div>
      )}

      {/* Predictions dropdown */}
      {showPredictions && isLoaded && !mapsError && (
        <div 
          ref={predictionsRef}
          className="absolute z-30 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto"
        >
          {isLoadingPredictions ? (
            <div className="p-2 text-sm text-gray-500 text-center">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
              Loading suggestions...
            </div>
          ) : predictions.length > 0 ? (
            <ul>
              {predictions.map((prediction) => (
                <li 
                  key={prediction.place_id}
                  className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  onClick={() => handlePredictionClick(prediction)}
                >
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-2 text-gray-400" />
                    {prediction.description}
                  </div>
                </li>
              ))}
            </ul>
          ) : inputValue.length >= 2 ? (
            <div className="p-2 text-sm text-gray-500 text-center">
              No suggestions found. Please try a different search.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
