
import { generateVendors } from '@/utils/vendorGenerator';

// Simulate API call delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getVendorsForTask = async (
  taskType: string,
  userLocation?: { lat: number; lng: number },
  locationAddress?: string
) => {
  try {
    // Simulate API call
    await delay(1000);
    
    // Get event budget from localStorage if available
    const storedEvents = localStorage.getItem('events');
    let budget;
    
    if (storedEvents) {
      const events = JSON.parse(storedEvents);
      const currentEvent = events.find((e: any) => 
        e.location === locationAddress
      );
      
      if (currentEvent?.budget) {
        // Convert budget string (₹50000) to number (50000)
        budget = parseInt(currentEvent.budget.replace(/[^0-9]/g, ''));
      }
    }

    // If no location is provided, use a default location
    const defaultLocation = 'Majhitar, East Sikkim, India';
    const location = locationAddress || defaultLocation;

    const vendors = generateVendors(
      taskType,
      location,
      budget
    );

    return {
      success: true,
      vendors,
      locationUsed: location,
      message: `Found ${vendors.length} vendors for ${taskType}`
    };
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return {
      success: false,
      vendors: [],
      message: 'Failed to fetch vendors'
    };
  }
};
