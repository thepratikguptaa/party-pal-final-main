
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, X } from "lucide-react";
import { 
  getAddressSuggestions, 
  geocodeAddress 
} from "@/utils/geocodingService";
import { useToast } from "@/hooks/use-toast";

interface LocationSearchInputProps {
  value: string;
  onChange: (value: string, coordinates?: { lat: number; lng: number }) => void;
  onFocus?: () => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function LocationSearchInput({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder = "Enter location",
  className = "",
  id = "location-search"
}: LocationSearchInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Update local state when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle clicks outside the component to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch suggestions when input changes
  const fetchSuggestions = async (text: string) => {
    if (!text || text.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await getAddressSuggestions(text);
      setSuggestions(results);
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce the fetchSuggestions function
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    
    // Geocode the selected address to get coordinates
    try {
      const result = await geocodeAddress(suggestion);
      if (result.success && result.coordinates) {
        onChange(result.formattedAddress || suggestion, result.coordinates);
        
        toast({
          title: "Address confirmed",
          description: "Location validated successfully",
        });
      } else {
        onChange(suggestion);
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
      onChange(suggestion);
    }
  };

  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      if (!navigator.geolocation) {
        toast({
          title: "Location error",
          description: "Geolocation is not supported by your browser",
          variant: "destructive"
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // In a real app, we would use reverse geocoding here
          await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
          
          // Based on the coordinates, determine approximate location (mock for demo)
          let location = "Unknown Location";
          
          // NYC area
          if (latitude > 39 && latitude < 42 && longitude > -75 && longitude < -73) {
            location = "Manhattan, New York, NY";
          } 
          // SF area
          else if (latitude > 37 && latitude < 38 && longitude > -123 && longitude < -122) {
            location = "101 Market St, San Francisco, CA";
          } 
          // Chicago area
          else if (latitude > 41 && latitude < 42 && longitude > -88 && longitude < -87) {
            location = "233 Michigan Ave, Chicago, IL";
          } 
          // LA area
          else if (latitude > 33 && latitude < 35 && longitude > -119 && longitude < -118) {
            location = "350 Hollywood Blvd, Los Angeles, CA";
          } 
          // Default to a generic location based on coords
          else {
            location = `${Math.floor(Math.abs(latitude * 100))} Main St, Anytown, USA`;
          }
          
          setInputValue(location);
          onChange(location, { lat: latitude, lng: longitude });
          
          toast({
            title: "Location detected",
            description: `Set to ${location}`,
          });
          setIsLoadingLocation(false);
        },
        (error) => {
          let message = "Unable to retrieve your location";
          if (error.code === 1) {
            message = "Location access denied. Please enable location services.";
          }
          toast({
            title: "Location error",
            description: message,
            variant: "destructive"
          });
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } catch (error) {
      console.error("Error getting current location:", error);
      toast({
        title: "Location error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      setIsLoadingLocation(false);
    }
  };

  const handleClearInput = () => {
    setInputValue("");
    onChange("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputFocus = () => {
    if (inputValue.length >= 3) {
      setShowSuggestions(true);
    }
    if (onFocus) onFocus();
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      // Only hide if the active element is not in our suggestions
      if (suggestionsRef.current && !suggestionsRef.current.contains(document.activeElement)) {
        setShowSuggestions(false);
      }
    }, 200);
    
    if (onBlur) onBlur(e);
  };

  return (
    <div className="relative w-full">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            id={id}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            className={`pr-8 ${className}`}
            autoComplete="off"
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
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="flex-shrink-0"
          onClick={handleGetCurrentLocation}
          disabled={isLoadingLocation}
          title="Use current location"
        >
          {isLoadingLocation ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Address suggestions dropdown */}
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute z-30 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-2 text-sm text-gray-500 text-center">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
              Loading suggestions...
            </div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((suggestion, index) => (
                <li 
                  key={`${suggestion}-${index}`}
                  className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-2 text-gray-400" />
                    {suggestion}
                  </div>
                </li>
              ))}
            </ul>
          ) : inputValue.length >= 3 ? (
            <div className="p-2 text-sm text-gray-500 text-center">
              No suggestions found. Please try a different search.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
