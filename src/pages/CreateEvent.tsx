
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { VoiceInput } from "@/components/VoiceInput";
import { EventTypeSelector } from "@/components/event-creation/EventTypeSelector";
import { EventDetailsForm } from "@/components/event-creation/EventDetailsForm";
import { ProgressSteps } from "@/components/event-creation/ProgressSteps";
import { toast } from "@/components/ui/sonner";

// Default location coordinates for Majhitar, East Sikkim, India
const DEFAULT_LOCATION = {
  address: 'Majhitar, East Sikkim, India',
  coordinates: { lat: 27.1442, lng: 88.5614 }
};

export default function CreateEvent() {
  const [step, setStep] = useState(1);
  const [selectedEventType, setSelectedEventType] = useState("");
  const navigate = useNavigate();
  
  const handleEventTypeSelect = (eventTypeId: string) => {
    setSelectedEventType(eventTypeId);
    setStep(2);
  };
  
  const handleCreateEvent = (eventDetails: any) => {
    const existingEvents = localStorage.getItem('events') 
      ? JSON.parse(localStorage.getItem('events') || '[]')
      : [];
    
    // Generate a unique ID
    const maxId = existingEvents.length > 0
      ? Math.max(...existingEvents.map((e: any) => e.id))
      : 0;
    
    // Use the provided location or fall back to default
    const location = eventDetails.location || DEFAULT_LOCATION.address;
    const locationCoords = eventDetails.locationCoords && 
                          (eventDetails.locationCoords.lat !== 0 || eventDetails.locationCoords.lng !== 0)
                          ? eventDetails.locationCoords 
                          : DEFAULT_LOCATION.coordinates;
    
    // Format the budget with INR symbol and ensure it's treated as INR
    const budget = eventDetails.budget 
      ? eventDetails.budget.toString().startsWith('₹') 
        ? eventDetails.budget 
        : `₹${eventDetails.budget}`
      : '₹0';

    const newEvent = {
      id: maxId + 1,
      title: eventDetails.title || `New Event ${maxId + 1}`,
      date: eventDetails.date || new Date().toISOString().split('T')[0],
      location: location,
      locationCoords: locationCoords,
      progress: 0,
      guestCount: eventDetails.guestCount || 0,
      budget: budget,
      currency: 'INR', // Explicitly set to INR
      isFinished: false
    };
    
    // Save to localStorage
    localStorage.setItem('events', JSON.stringify([...existingEvents, newEvent]));
    
    toast("Event Created", {
      description: `${newEvent.title} has been added to your events.`
    });
    
    navigate("/dashboard");
  };

  const processVoiceInput = (text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('wedding')) {
      handleEventTypeSelect('wedding');
    } else if (lowerText.includes('corporate')) {
      handleEventTypeSelect('corporate');
    } else if (lowerText.includes('social')) {
      handleEventTypeSelect('social');
    } else if (lowerText.includes('custom')) {
      handleEventTypeSelect('other');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Event</h1>
              <p className="text-gray-600">Let's start planning your perfect event with voice commands or manual input.</p>
            </div>
            <VoiceInput 
              onVoiceInput={processVoiceInput}
              placeholder="Try saying 'Create a wedding event'"
            />
          </div>
          
          <ProgressSteps currentStep={step} />
          
          {step === 1 && (
            <EventTypeSelector
              selectedType={selectedEventType}
              onTypeSelect={handleEventTypeSelect}
              onVoiceInput={processVoiceInput}
            />
          )}
          
          {step === 2 && (
            <EventDetailsForm
              onBack={() => setStep(1)}
              onSubmit={handleCreateEvent}
              onVoiceInput={processVoiceInput}
            />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
