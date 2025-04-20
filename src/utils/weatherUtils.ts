
import { format, addDays, subDays, parseISO, isValid } from "date-fns";

export interface WeatherDay {
  date: string; // ISO date string
  tempDay: number;
  tempNight: number;
  description: string;
  icon: string;
}

// Map of common locations to their typical weather patterns
// This is a mock that simulates what we might get from an API
const LOCATION_WEATHER_MAP: Record<string, { 
  baseTemp: number, 
  variance: number,
  conditions: string[],
  icons: string[] 
}> = {
  // Northern India
  "sikkim": { baseTemp: 22, variance: 8, 
    conditions: ["Partly cloudy", "Mostly sunny", "Clear sky", "Light rain"],
    icons: ["02d", "01d", "01d", "10d"]
  },
  "darjeeling": { baseTemp: 18, variance: 10, 
    conditions: ["Foggy", "Partly cloudy", "Light rain", "Clear sky"],
    icons: ["50d", "02d", "10d", "01d"]
  },
  "gangtok": { baseTemp: 20, variance: 8, 
    conditions: ["Partly cloudy", "Moderate rain", "Light rain", "Clear sky"],
    icons: ["02d", "09d", "10d", "01d"]
  },
  
  // Southern India
  "bangalore": { baseTemp: 30, variance: 5, 
    conditions: ["Partly cloudy", "Mostly sunny", "Clear sky", "Light rain"],
    icons: ["02d", "01d", "01d", "10d"]
  },
  "chennai": { baseTemp: 33, variance: 4, 
    conditions: ["Hot and humid", "Mostly sunny", "Partly cloudy", "Thunderstorms"],
    icons: ["01d", "01d", "02d", "11d"]
  },
  "hyderabad": { baseTemp: 32, variance: 6, 
    conditions: ["Mostly sunny", "Clear sky", "Partly cloudy", "Light rain"],
    icons: ["01d", "01d", "02d", "10d"]
  },

  // Metro cities
  "delhi": { baseTemp: 32, variance: 10, 
    conditions: ["Hazy", "Very hot", "Dusty", "Smoggy"],
    icons: ["50d", "01d", "50d", "50d"]
  },
  "mumbai": { baseTemp: 30, variance: 6, 
    conditions: ["Humid", "Light rain", "Partly cloudy", "Thunderstorms"],
    icons: ["01d", "10d", "02d", "11d"]
  },
  "kolkata": { baseTemp: 31, variance: 7, 
    conditions: ["Humid", "Hot", "Partly cloudy", "Thunderstorms"],
    icons: ["01d", "01d", "02d", "11d"]
  },

  // Default
  "default": { baseTemp: 25, variance: 5, 
    conditions: ["Sunny", "Partly cloudy", "Light rain", "Clear sky"],
    icons: ["01d", "02d", "10d", "01d"]
  }
};

// Get location data based on address string
const getLocationData = (location: string) => {
  location = location.toLowerCase();
  
  // Check if any of our predefined locations are in the address
  for (const key of Object.keys(LOCATION_WEATHER_MAP)) {
    if (location.includes(key)) {
      return LOCATION_WEATHER_MAP[key];
    }
  }
  
  // If specific states are mentioned
  if (location.includes('sikkim') || location.includes('arunachal') || 
      location.includes('assam') || location.includes('meghalaya') || 
      location.includes('himachal') || location.includes('uttarakhand')) {
    return LOCATION_WEATHER_MAP['darjeeling']; // Cooler, mountainous regions
  }
  
  if (location.includes('kerala') || location.includes('goa') || 
      location.includes('maharashtra') || location.includes('gujarat')) {
    return LOCATION_WEATHER_MAP['mumbai']; // Coastal, humid
  }
  
  if (location.includes('rajasthan')) {
    return { ...LOCATION_WEATHER_MAP['delhi'], baseTemp: 35 }; // Hot and dry
  }
  
  if (location.includes('tamil') || location.includes('karnataka') || 
      location.includes('andhra') || location.includes('telangana')) {
    return LOCATION_WEATHER_MAP['bangalore']; // Southern regions
  }
  
  // Default weather data
  return LOCATION_WEATHER_MAP['default'];
};

// Generate random but consistent weather data for the given date range
export const generateWeatherForecast = (eventDate: string, location: string): WeatherDay[] => {
  const weatherData: WeatherDay[] = [];
  const parsedDate = parseISO(eventDate);
  
  // Return empty array if date is invalid
  if (!isValid(parsedDate)) {
    return weatherData;
  }
  
  const locationData = getLocationData(location);
  
  // Generate weather for 3 days before and 3 days after the event
  for (let i = -3; i <= 3; i++) {
    const date = i < 0 ? subDays(parsedDate, Math.abs(i)) : addDays(parsedDate, i);
    
    // Use a consistent seed based on the date and location for "randomness"
    const dateSeed = date.getDate() + (date.getMonth() * 31);
    const conditionIndex = (dateSeed + location.length) % locationData.conditions.length;
    
    // Temperature varies by day of the month for consistency
    const tempVariation = ((dateSeed % 10) - 5) / 5 * locationData.variance;
    const dayTemp = locationData.baseTemp + tempVariation;
    const nightTemp = dayTemp - (5 + (dateSeed % 5));
    
    weatherData.push({
      date: date.toISOString(),
      tempDay: parseFloat(dayTemp.toFixed(1)),
      tempNight: parseFloat(nightTemp.toFixed(1)),
      description: locationData.conditions[conditionIndex],
      icon: locationData.icons[conditionIndex]
    });
  }
  
  return weatherData;
};

// Function to get weather icon URL
export const getWeatherIconUrl = (iconCode: string) =>
  `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
