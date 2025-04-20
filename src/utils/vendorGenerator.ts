
// Helper function to generate random Indian phone numbers
const generateIndianPhoneNumber = () => {
  const prefixes = ['91', '98', '70', '89', '99'];
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomNumber = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return `+91 ${randomPrefix}${randomNumber}`;
};

// Helper function to generate random Indian business names
const generateBusinessName = (type: string) => {
  const prefixes = ['Shree', 'New', 'Royal', 'Star', 'Krishna', 'Ganesh', 'Om', 'Raj'];
  const suffixes = ['Enterprise', 'Services', 'Solutions', 'Events', 'Decorators', 'Caterers'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return `${prefix} ${type} ${suffix}`;
};

// Generate price range based on budget
const generatePriceRange = (budget: number) => {
  if (!budget || budget <= 0) return '₹₹';
  
  if (budget < 50000) return '₹';
  if (budget < 200000) return '₹₹';
  if (budget < 500000) return '₹₹₹';
  return '₹₹₹₹';
};

// Generate a nearby address based on user's location
const generateNearbyAddress = (baseAddress: string) => {
  // Extract main location components (assuming format: "area, city, state")
  const addressParts = baseAddress.split(',').map(part => part.trim());
  const mainArea = addressParts[0];
  const city = addressParts[1] || mainArea;
  const state = addressParts[2] || city;

  // List of possible nearby areas
  const nearbyAreas = [
    'Main Market', 'Central Area', 'New Colony', 'Old Market', 
    'Station Road', 'MG Road', 'City Center', 'Gandhi Nagar',
    'Civil Lines', 'Sector 1', 'Phase 2', 'Commercial Hub'
  ];
  
  // List of possible landmarks
  const landmarks = [
    'Near Bus Stand', 'Opposite Railway Station', 'Behind Temple',
    'Next to Park', 'Near Hospital', 'Beside School', 'Near Mall',
    'Close to Metro Station', 'Market Complex'
  ];

  const randomArea = nearbyAreas[Math.floor(Math.random() * nearbyAreas.length)];
  const randomLandmark = landmarks[Math.floor(Math.random() * landmarks.length)];

  // Generate a random building/shop number
  const buildingNumber = Math.floor(Math.random() * 200) + 1;

  return `${buildingNumber}, ${randomArea}, ${randomLandmark}, ${city}, ${state}`;
};

export const generateVendors = (
  taskType: string, 
  location: string, 
  budget?: number
) => {
  const vendors = [];
  const numVendors = Math.floor(Math.random() * 3) + 3; // Generate 3-5 vendors
  
  for (let i = 0; i < numVendors; i++) {
    vendors.push({
      name: generateBusinessName(taskType),
      phone: generateIndianPhoneNumber(),
      email: `info@${taskType.toLowerCase()}${i + 1}.com`,
      address: generateNearbyAddress(location),
      website: `${taskType.toLowerCase()}${i + 1}.in`,
      rating: (3.5 + Math.random() * 1.5).toFixed(1),
      reviews: Math.floor(Math.random() * 100) + 20,
      years_in_business: Math.floor(Math.random() * 15) + 5,
      price_range: generatePriceRange(budget),
      distance: `${(Math.random() * 2).toFixed(1)} km away`,
      services: [
        taskType,
        'Custom Planning',
        'Full Service',
        '24/7 Support'
      ]
    });
  }
  
  return vendors;
};
