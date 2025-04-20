import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, AlertCircle } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useToast } from "@/hooks/use-toast";

interface VoiceInputProps {
  onVoiceInput: (text: string) => void;
  placeholder?: string;
}

export function VoiceInput({ onVoiceInput, placeholder = "Click to speak" }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const supported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    setIsSupported(supported);
    
    if (!supported) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support voice input. Try using Chrome, Edge, or Safari.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const { startListening, stopListening } = useSpeechRecognition({
    onResult: (text) => {
      onVoiceInput(text);
      setIsListening(false);
      toast({
        title: "Voice input received",
        description: text,
      });
    },
    onEnd: () => {
      setIsListening(false);
    },
  });

  const handleToggleListening = () => {
    if (!isSupported) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support voice input. Try using Chrome, Edge, or Safari.",
        variant: "destructive",
      });
      return;
    }

    if (!isListening) {
      setIsListening(true);
      startListening();
      toast({
        title: "Listening...",
        description: placeholder,
      });
    } else {
      setIsListening(false);
      stopListening();
    }
  };

  if (!isSupported) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="bg-gray-100"
        title="Speech recognition not supported in this browser"
        disabled
      >
        <AlertCircle className="h-4 w-4 text-red-500" />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={`voice-input-button ${isListening ? 'bg-red-100 hover:bg-red-200' : ''}`}
      onClick={handleToggleListening}
    >
      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
}
