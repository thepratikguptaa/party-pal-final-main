
// Utility to load Google Maps API

// Use an API key that supports Places API
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDQ3mJIYxqgiFwUlCrCUE_XZiUMhHl64_M'; 

// NOTE: For production use, always use environment variables for API keys 

interface GoogleMapsLoaderState {
  isLoaded: boolean;
  isLoading: boolean;
  error: Error | null;
}

type GoogleMapsLoaderCallback = (state: GoogleMapsLoaderState) => void;

class GoogleMapsLoader {
  private static instance: GoogleMapsLoader;
  private state: GoogleMapsLoaderState = {
    isLoaded: false,
    isLoading: false,
    error: null
  };
  private callbacks: GoogleMapsLoaderCallback[] = [];
  private loadAttempts = 0;
  private maxAttempts = 2;

  private constructor() {}

  public static getInstance(): GoogleMapsLoader {
    if (!GoogleMapsLoader.instance) {
      GoogleMapsLoader.instance = new GoogleMapsLoader();
    }
    return GoogleMapsLoader.instance;
  }

  public load(): Promise<void> {
    return new Promise((resolve, reject) => {
      // If already loaded, resolve immediately
      if (this.state.isLoaded) {
        resolve();
        return;
      }

      // If loading in progress, wait for it to complete
      if (this.state.isLoading) {
        this.callbacks.push((state) => {
          if (state.error) reject(state.error);
          else resolve();
        });
        return;
      }

      // Start loading
      this.state.isLoading = true;
      this.notifyCallbacks();

      // Check if script is already in DOM
      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        existingScript.remove(); // Remove existing script if there was an error
      }

      // Create and append script tag with region parameter set to India
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&region=in&language=en`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        // Check if Google Maps loaded correctly
        if (window.google && window.google.maps) {
          this.handleScriptLoad();
          resolve();
        } else {
          this.handleScriptError(new Error('Google Maps did not initialize properly'));
          reject(new Error('Google Maps did not initialize properly'));
        }
      };
      
      script.onerror = (error) => {
        this.handleScriptError(new Error('Failed to load Google Maps API'));
        reject(new Error('Failed to load Google Maps API'));
      };
      
      document.head.appendChild(script);

      // Set a timeout to catch cases where the script loads but doesn't initialize properly
      setTimeout(() => {
        if (!this.state.isLoaded && this.state.isLoading) {
          this.handleScriptError(new Error('Google Maps loading timed out'));
          reject(new Error('Google Maps loading timed out'));
        }
      }, 10000); // 10 second timeout
    });
  }

  private handleScriptLoad() {
    this.state = { isLoaded: true, isLoading: false, error: null };
    this.notifyCallbacks();
    console.log('Google Maps loaded successfully');
  }

  private handleScriptError(error: Error) {
    this.loadAttempts++;
    
    if (this.loadAttempts < this.maxAttempts) {
      console.warn(`Google Maps loading failed, attempt ${this.loadAttempts}/${this.maxAttempts}`, error);
      this.state = { isLoaded: false, isLoading: false, error: null };
      // Will try again on next load() call
    } else {
      console.error('Google Maps loading failed after multiple attempts:', error);
      this.state = { isLoaded: false, isLoading: false, error };
    }
    
    this.notifyCallbacks();
  }

  private notifyCallbacks() {
    this.callbacks.forEach(callback => callback(this.state));
    if (this.state.isLoaded || this.state.error) {
      this.callbacks = [];
    }
  }

  public getState(): GoogleMapsLoaderState {
    return this.state;
  }

  public subscribe(callback: GoogleMapsLoaderCallback): () => void {
    this.callbacks.push(callback);
    callback(this.state); // Call immediately with current state
    
    // Return unsubscribe function
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }
}

export default GoogleMapsLoader;
