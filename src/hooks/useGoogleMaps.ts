
import { useState, useEffect } from 'react';
import GoogleMapsLoader from '../utils/googleMapsLoader';
import { useToast } from '@/hooks/use-toast';

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loader = GoogleMapsLoader.getInstance();
    
    // Subscribe to loader state changes
    const unsubscribe = loader.subscribe(state => {
      setIsLoaded(state.isLoaded);
      setIsLoading(state.isLoading);
      
      if (state.error && !error) {
        setError(state.error);
        toast({
          title: "Maps API Error",
          description: "Could not load location services. Showing default location data.",
          variant: "destructive"
        });
      }
    });

    // Initialize loading if not already loaded
    if (!isLoaded && !isLoading) {
      loader.load().catch(err => {
        console.error("Error loading Google Maps API:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      });
    }

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [isLoaded, isLoading, error]);

  return { isLoaded, isLoading, error };
}
