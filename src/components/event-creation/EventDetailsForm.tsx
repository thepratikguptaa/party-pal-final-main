import { useState, useRef } from "react";
import { VoiceInput } from "@/components/VoiceInput";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { parseNaturalLanguageDate } from "@/utils/dateUtils";
import { format } from "date-fns";
import { Loader2, MapPin, IndianRupee } from "lucide-react";
import { GooglePlacesAutocomplete } from "@/components/GooglePlacesAutocomplete";
import { LocationMapSelector } from "@/components/LocationMapSelector";
import { getVendorsForTask } from "@/services/justDialService";

interface EventDetailsFormProps {
  onBack: () => void;
  onSubmit: (eventDetails: any) => void;
  onVoiceInput: (text: string) => void;
}

export function EventDetailsForm({ onBack, onSubmit, onVoiceInput }: EventDetailsFormProps) {
  const [formData, setFormData] = useState({
    eventName: "",
    eventDate: "",
    guestCount: "",
    location: "",
    locationCoords: { lat: 0, lng: 0 },
    description: "",
    budget: ""
  });
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const { toast } = useToast();
  const activeFieldRef = useRef<string | null>(null);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    activeFieldRef.current = e.target.id;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    requestAnimationFrame(() => {
      const activeElement = document.activeElement;
      if (activeElement?.tagName === 'BUTTON' && activeElement.classList.contains('voice-input-button')) {
        return;
      }
      if (!activeElement || 
          !(activeElement instanceof HTMLInputElement || 
            activeElement instanceof HTMLTextAreaElement)) {
        activeFieldRef.current = null;
      }
    });
  };

  const handleVoiceInput = (text: string) => {
    if (activeFieldRef.current && Object.keys(formData).includes(activeFieldRef.current)) {
      if (activeFieldRef.current === 'eventDate') {
        const parsedDate = parseNaturalLanguageDate(text);
        if (parsedDate) {
          const formattedDate = format(parsedDate, 'yyyy-MM-dd');
          setFormData(prev => ({
            ...prev,
            eventDate: formattedDate
          }));
          
          toast({
            title: "Date recognized",
            description: `Set date to ${format(parsedDate, 'PPPP')}`,
          });
          return;
        }
      }
      
      setFormData(prev => ({
        ...prev,
        [activeFieldRef.current!]: text
      }));
      
      toast({
        title: "Voice input received",
        description: `Updated ${activeFieldRef.current} with "${text}"`,
      });
    } else {
      toast({
        title: "No input field selected",
        description: "Please select a field before using voice input",
        variant: "destructive",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleLocationChange = async (place: { 
    address: string; 
    coordinates: { lat: number; lng: number };
    placeId?: string;
  } | null) => {
    if (place) {
      setFormData(prev => ({
        ...prev,
        location: place.address,
        locationCoords: place.coordinates
      }));

      try {
        const vendorResponse = await getVendorsForTask('venue', place.coordinates, place.address);
        if (vendorResponse.success) {
          toast({
            title: "Location set",
            description: `Successfully set event location to ${place.address}`,
          });
        }
      } catch (error) {
        console.error("Error setting location:", error);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        location: '',
        locationCoords: { lat: 0, lng: 0 }
      }));
    }
  };

  const handleSubmit = () => {
    onSubmit({
      title: formData.eventName,
      date: formData.eventDate,
      location: formData.location,
      locationCoords: formData.locationCoords,
      guestCount: formData.guestCount ? parseInt(formData.guestCount, 10) : 0,
      description: formData.description,
      budget: formData.budget
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Enter Basic Details</h2>
        <VoiceInput 
          onVoiceInput={handleVoiceInput}
          placeholder="Speak to fill the current field"
        />
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-1">
                Event Name
              </label>
              <Input 
                id="eventName"
                value={formData.eventName}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Enter a name for your event"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Date
                </label>
                <Input 
                  id="eventDate"
                  type="date" 
                  value={formData.eventDate}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
              
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                  Budget (₹)
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <IndianRupee className="h-4 w-4" />
                  </div>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder="Enter your budget"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Guests: {formData.guestCount || "50"}
              </label>
              <div className="pt-2 pb-4 px-1">
                <input
                  type="range"
                  id="guestCount"
                  value={formData.guestCount || "50"}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  min="5"
                  max="500"
                  step="5"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-party-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5</span>
                  <span>250</span>
                  <span>500</span>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Event Location
              </label>
              <div className="space-y-4">
                <GooglePlacesAutocomplete
                  id="location"
                  value={formData.location}
                  onChange={handleLocationChange}
                  onFocus={() => activeFieldRef.current = 'location'}
                  onBlur={(e) => handleBlur(e as unknown as React.FocusEvent<HTMLTextAreaElement>)}
                  placeholder="Search for a location or use the map below"
                />
                
                <LocationMapSelector
                  currentLocation={formData.locationCoords.lat !== 0 ? formData.locationCoords : undefined}
                  onLocationSelect={handleLocationChange}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Event Description
              </label>
              <Textarea 
                id="description"
                value={formData.description}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Describe your event and any special requirements"
                className="h-24 resize-none"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button 
            variant="outline" 
            onClick={onBack}
          >
            Back
          </Button>
          <Button 
            className="bg-party-500 hover:bg-party-600"
            onClick={handleSubmit}
          >
            Create Event
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
