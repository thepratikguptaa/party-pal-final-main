
interface UseSpeechRecognitionProps {
  onResult: (text: string) => void;
  onEnd?: () => void;
}

export const useSpeechRecognition = ({ onResult, onEnd }: UseSpeechRecognitionProps) => {
  // Check if the browser supports SpeechRecognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.error('Speech recognition is not supported in this browser');
    // Return a dummy implementation when not supported
    return {
      startListening: () => console.error('Speech recognition not supported'),
      stopListening: () => {},
    };
  }

  const recognition = new SpeechRecognition();
  
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    onResult(text);
  };

  recognition.onend = () => {
    onEnd?.();
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    onEnd?.();
  };

  const startListening = () => {
    try {
      recognition.start();
    } catch (error) {
      console.error('Speech recognition error:', error);
      onEnd?.();
    }
  };

  const stopListening = () => {
    try {
      recognition.stop();
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
  };

  return {
    startListening,
    stopListening,
  };
};
