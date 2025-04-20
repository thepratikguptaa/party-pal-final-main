
// Geocoding service to handle location validation and coordinates

interface GeocodeResult {
  success: boolean;
  address?: string;
  formattedAddress?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  message?: string;
}

/**
 * Geocodes an address string to get coordinates
 */
export const geocodeAddress = async (address: string): Promise<GeocodeResult> => {
  if (!address.trim()) {
    return {
      success: false,
      message: "Please enter a valid address"
    };
  }

  try {
    // For now, we'll simulate a geocoding service since we don't have API keys
    // In a real implementation, you would use Google Maps Geocoding API or similar
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

    // Create a fake but realistic response based on the address
    // This would normally come from the geocoding API
    
    // Extract any city or state mentioned in the address
    const cityStateMatch = address.match(/([A-Za-z\s]+),\s*([A-Za-z]{2})/);
    let formattedAddress = address;
    let lat = 40.7128; // Default to NYC coordinates
    let lng = -74.006;

    if (cityStateMatch) {
      const city = cityStateMatch[1].trim().toLowerCase();
      
      // Provide more realistic coordinates based on common city names
      if (city.includes('new york') || city.includes('nyc')) {
        lat = 40.7128;
        lng = -74.006;
        formattedAddress = address.includes('NY') ? address : `${address}, NY`;
      } else if (city.includes('los angeles') || city.includes('la')) {
        lat = 34.0522;
        lng = -118.2437;
        formattedAddress = address.includes('CA') ? address : `${address}, CA`;
      } else if (city.includes('chicago')) {
        lat = 41.8781;
        lng = -87.6298;
        formattedAddress = address.includes('IL') ? address : `${address}, IL`;
      } else if (city.includes('houston')) {
        lat = 29.7604;
        lng = -95.3698;
        formattedAddress = address.includes('TX') ? address : `${address}, TX`;
      } else if (city.includes('phoenix')) {
        lat = 33.4484;
        lng = -112.074;
        formattedAddress = address.includes('AZ') ? address : `${address}, AZ`;
      }
    }

    // If no city/state found, create a more standardized address format
    if (!formattedAddress.match(/\d+\s[A-Za-z\s]+,/)) {
      formattedAddress = `123 Main St, ${address}`;
    }

    return {
      success: true,
      address: address,
      formattedAddress: formattedAddress,
      coordinates: { lat, lng }
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return {
      success: false,
      message: "Failed to geocode address. Please try again."
    };
  }
};

/**
 * Get address suggestions for autocomplete
 */
export const getAddressSuggestions = async (input: string): Promise<string[]> => {
  if (!input.trim() || input.length < 3) {
    return [];
  }
  
  // Simulated autocomplete API call
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const inputLower = input.toLowerCase();
  
  // Common street names to use in suggestions
  const streets = ["Main St", "Broadway", "Park Ave", "Oak St", "Maple Ave", "Washington St", "Lincoln Ave"];
  const cities = [
    "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ",
    "Philadelphia, PA", "San Antonio, TX", "San Diego, CA", "Dallas, TX", "San Jose, CA"
  ];
  
  // Generate suggestions based on input
  let suggestions: string[] = [];
  
  // If input looks like the beginning of a street address (has a number)
  if (/^\d+/.test(input)) {
    // Extract the street number
    const numberMatch = input.match(/^(\d+)/);
    const streetNumber = numberMatch ? numberMatch[1] : "123";
    
    // Suggest full street addresses
    suggestions = streets
      .filter(street => street.toLowerCase().includes(inputLower.replace(/^\d+\s*/, "")))
      .map(street => `${streetNumber} ${street}, New York, NY`);
  } 
  // If input looks like a city name
  else {
    suggestions = cities.filter(city => city.toLowerCase().includes(inputLower));
    
    // Add some specific addresses if the input matches a city
    for (const city of cities) {
      if (city.toLowerCase().includes(inputLower)) {
        const cityName = city.split(',')[0];
        streets.slice(0, 3).forEach(street => {
          suggestions.push(`123 ${street}, ${cityName}, ${city.split(',')[1].trim()}`);
        });
        break;
      }
    }
  }
  
  return suggestions.slice(0, 5); // Limit to top 5 suggestions
};
