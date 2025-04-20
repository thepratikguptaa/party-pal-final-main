
// Budget categories with typical percentage allocations by event type
export interface BudgetCategory {
  name: string;
  percentage: number;
  description: string;
  tasks: string[];
}

export interface BudgetAllocation {
  category: string;
  amount: number;
  percentage: number;
  tasks: { name: string; amount: number }[];
}

export type EventType = 'wedding' | 'corporate' | 'birthday' | 'social' | 'other';

// Default budget allocation percentages by event type
const BUDGET_ALLOCATIONS: Record<EventType, BudgetCategory[]> = {
  wedding: [
    { 
      name: 'Venue & Catering', 
      percentage: 45, 
      description: 'Venue rental, food, drinks, and service',
      tasks: ['Book wedding venue', 'Arrange catering', 'Setup bar service']
    },
    { 
      name: 'Decor & Flowers', 
      percentage: 15, 
      description: 'Decorations, floral arrangements, lighting',
      tasks: ['Hire decorator', 'Order flowers', 'Arrange lighting']
    },
    { 
      name: 'Photography & Video', 
      percentage: 12, 
      description: 'Professional photography and videography',
      tasks: ['Hire photographer', 'Book videographer', 'Plan photo sessions']
    },
    { 
      name: 'Attire & Beauty', 
      percentage: 10, 
      description: 'Wedding attire, accessories, makeup, and hair',
      tasks: ['Purchase outfits', 'Schedule makeup', 'Book hair styling']
    },
    { 
      name: 'Music & Entertainment', 
      percentage: 8, 
      description: 'DJ, band, or other entertainment',
      tasks: ['Book DJ or band', 'Plan entertainment', 'Create playlist']
    },
    { 
      name: 'Transportation', 
      percentage: 5, 
      description: 'Transportation for couple and guests',
      tasks: ['Arrange transportation', 'Book vehicles', 'Plan logistics']
    },
    { 
      name: 'Miscellaneous', 
      percentage: 5, 
      description: 'Gifts, stationery, and unexpected expenses',
      tasks: ['Order wedding favors', 'Purchase thank you cards', 'Budget for extras']
    }
  ],
  
  corporate: [
    { 
      name: 'Venue & Setup', 
      percentage: 35, 
      description: 'Venue rental, equipment, staging',
      tasks: ['Book venue', 'Arrange setup', 'Organize equipment']
    },
    { 
      name: 'Catering & Refreshments', 
      percentage: 25, 
      description: 'Food, drinks, and service',
      tasks: ['Confirm catering order', 'Setup refreshments', 'Plan meal options']
    },
    { 
      name: 'Technology & AV', 
      percentage: 15, 
      description: 'Audio/visual equipment, tech support',
      tasks: ['Rent AV equipment', 'Setup presentation tech', 'Test all systems']
    },
    { 
      name: 'Speakers & Entertainment', 
      percentage: 10, 
      description: 'Guest speakers, entertainment, activities',
      tasks: ['Book speakers', 'Plan activities', 'Schedule entertainment']
    },
    { 
      name: 'Marketing & Materials', 
      percentage: 8, 
      description: 'Printed materials, signage, promotional items',
      tasks: ['Design materials', 'Print collateral', 'Create signage']
    },
    { 
      name: 'Staff & Services', 
      percentage: 5, 
      description: 'Event staff, coordinators, security',
      tasks: ['Hire event staff', 'Arrange security', 'Schedule coordinators']
    },
    { 
      name: 'Miscellaneous', 
      percentage: 2, 
      description: 'Unexpected expenses and contingency',
      tasks: ['Plan for contingencies', 'Prepare backup options', 'Set aside emergency funds']
    }
  ],
  
  birthday: [
    { 
      name: 'Venue & Space', 
      percentage: 30, 
      description: 'Location rental, setup, decoration',
      tasks: ['Choose party venue', 'Arrange setup', 'Decorate space']
    },
    { 
      name: 'Food & Cake', 
      percentage: 25, 
      description: 'Catering, cake, and refreshments',
      tasks: ['Order cake and food', 'Plan menu', 'Arrange refreshments']
    },
    { 
      name: 'Entertainment', 
      percentage: 20, 
      description: 'Music, games, activities, performers',
      tasks: ['Plan entertainment', 'Organize games', 'Book performers']
    },
    { 
      name: 'Decorations & Supplies', 
      percentage: 15, 
      description: 'Theme decorations, balloons, party supplies',
      tasks: ['Choose party theme', 'Buy decorations', 'Get party supplies']
    },
    { 
      name: 'Gifts & Favors', 
      percentage: 7, 
      description: 'Party favors, gift bags, prizes',
      tasks: ['Prepare party favors', 'Get prizes', 'Create gift bags']
    },
    { 
      name: 'Miscellaneous', 
      percentage: 3, 
      description: 'Photography, extra expenses',
      tasks: ['Arrange photography', 'Plan for extras', 'Prepare contingencies']
    }
  ],
  
  social: [
    { 
      name: 'Venue & Setup', 
      percentage: 35, 
      description: 'Venue rental, furniture, setup',
      tasks: ['Book venue', 'Arrange furniture', 'Setup space']
    },
    { 
      name: 'Food & Beverages', 
      percentage: 30, 
      description: 'Catering, drinks, service',
      tasks: ['Order catering', 'Setup bar service', 'Plan menu']
    },
    { 
      name: 'Decor & Atmosphere', 
      percentage: 15, 
      description: 'Decorations, lighting, ambiance',
      tasks: ['Plan decor', 'Arrange lighting', 'Create atmosphere']
    },
    { 
      name: 'Entertainment & Activities', 
      percentage: 10, 
      description: 'Music, performances, activities',
      tasks: ['Book entertainment', 'Plan activities', 'Create playlist']
    },
    { 
      name: 'Invitations & Communication', 
      percentage: 5, 
      description: 'Invites, RSVPs, communications',
      tasks: ['Send invites', 'Track RSVPs', 'Communicate details']
    },
    { 
      name: 'Miscellaneous', 
      percentage: 5, 
      description: 'Extra expenses and contingency',
      tasks: ['Plan for extras', 'Prepare backup plans', 'Budget for emergencies']
    }
  ],
  
  other: [
    { 
      name: 'Venue & Facilities', 
      percentage: 35, 
      description: 'Location, facilities, basic setup',
      tasks: ['Book venue', 'Arrange setup', 'Check facilities']
    },
    { 
      name: 'Food & Refreshments', 
      percentage: 25, 
      description: 'Catering, drinks, service',
      tasks: ['Arrange catering', 'Order refreshments', 'Plan menu']
    },
    { 
      name: 'Services & Personnel', 
      percentage: 15, 
      description: 'Staff, services, coordination',
      tasks: ['Hire staff', 'Coordinate services', 'Assign responsibilities']
    },
    { 
      name: 'Equipment & Materials', 
      percentage: 10, 
      description: 'Necessary equipment and materials',
      tasks: ['Rent equipment', 'Purchase materials', 'Prepare supplies']
    },
    { 
      name: 'Decor & Presentation', 
      percentage: 10, 
      description: 'Visual elements, decor, presentation',
      tasks: ['Plan decor', 'Arrange presentation', 'Setup visuals']
    },
    { 
      name: 'Miscellaneous', 
      percentage: 5, 
      description: 'Additional expenses and contingency',
      tasks: ['Prepare for extras', 'Plan contingencies', 'Budget for emergencies']
    }
  ]
};

// Guest count scaling factors
// Example: If guest count > 200, venue costs might increase by 20%
const GUEST_COUNT_SCALING = {
  small: { max: 50, factor: 0.8 },
  medium: { max: 100, factor: 1.0 },
  large: { max: 200, factor: 1.2 },
  extraLarge: { max: Infinity, factor: 1.4 }
};

// Get guest count scaling factor
const getGuestCountFactor = (guestCount: number): number => {
  if (guestCount <= GUEST_COUNT_SCALING.small.max) {
    return GUEST_COUNT_SCALING.small.factor;
  } else if (guestCount <= GUEST_COUNT_SCALING.medium.max) {
    return GUEST_COUNT_SCALING.medium.factor;
  } else if (guestCount <= GUEST_COUNT_SCALING.large.max) {
    return GUEST_COUNT_SCALING.large.factor;
  } else {
    return GUEST_COUNT_SCALING.extraLarge.factor;
  }
};

// Adjust budget allocations based on guest count
const adjustForGuestCount = (
  categories: BudgetCategory[], 
  guestCount: number
): BudgetCategory[] => {
  const factor = getGuestCountFactor(guestCount);
  
  // Adjust the venue, catering, and related categories
  return categories.map(category => {
    let adjustment = 0;
    
    // Categories that scale with guest count
    const scalesWithGuests = [
      'venue', 'catering', 'food', 'drink', 'refreshment', 
      'seating', 'favor', 'gift'
    ];
    
    const categoryNameLower = category.name.toLowerCase();
    const shouldScale = scalesWithGuests.some(keyword => 
      categoryNameLower.includes(keyword)
    );
    
    if (shouldScale) {
      // Increase percentage for guest-dependent categories
      adjustment = (factor - 1) * category.percentage * 0.5;
    } else {
      // Slightly decrease other categories to maintain total of ~100%
      adjustment = -(factor - 1) * category.percentage * 0.1;
    }
    
    return {
      ...category,
      percentage: Math.max(1, category.percentage + adjustment)
    };
  });
};

// Calculate budget allocations based on event type, total budget, and guest count
export const calculateBudgetAllocations = (
  eventType: string, 
  totalBudget: number, 
  guestCount: number = 50
): BudgetAllocation[] => {
  // Default to 'other' if event type not found
  const type = (Object.keys(BUDGET_ALLOCATIONS).includes(eventType.toLowerCase()) 
    ? eventType.toLowerCase() 
    : 'other') as EventType;
  
  // Get categories for this event type
  let categories = [...BUDGET_ALLOCATIONS[type]];
  
  // Adjust for guest count
  categories = adjustForGuestCount(categories, guestCount);
  
  // Normalize percentages to ensure they sum to 100
  const totalPercentage = categories.reduce((sum, cat) => sum + cat.percentage, 0);
  categories = categories.map(cat => ({
    ...cat,
    percentage: (cat.percentage / totalPercentage) * 100
  }));
  
  // Calculate actual amounts
  return categories.map(category => {
    const amount = (category.percentage / 100) * totalBudget;
    
    // Calculate task-level allocations
    const totalTasks = category.tasks.length;
    const taskAmount = amount / totalTasks;
    
    const tasks = category.tasks.map(task => ({
      name: task,
      amount: Math.round(taskAmount)
    }));
    
    return {
      category: category.name,
      amount: Math.round(amount),
      percentage: Math.round(category.percentage),
      tasks
    };
  });
};

// Format currency in INR format
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

// Given a task name, find its budget category and allocation
export const getBudgetForTask = (
  taskName: string,
  eventType: string,
  totalBudget: number,
  guestCount: number = 50
): { amount: number; category: string; percentage: number } => {
  const allocations = calculateBudgetAllocations(eventType, totalBudget, guestCount);
  
  // Normalize task name for matching
  const normalizedTaskName = taskName.toLowerCase();
  
  // Check each allocation's tasks for a match
  for (const allocation of allocations) {
    for (const task of allocation.tasks) {
      // Check if task name contains the search term
      if (task.name.toLowerCase().includes(normalizedTaskName) || 
          normalizedTaskName.includes(task.name.toLowerCase())) {
        return {
          amount: task.amount,
          category: allocation.category,
          percentage: allocation.percentage
        };
      }
    }
  }
  
  // If no match found, return a default allocation from the miscellaneous category
  const miscCategory = allocations.find(a => a.category.includes('Miscellaneous'));
  if (miscCategory) {
    return {
      amount: Math.round(miscCategory.amount / miscCategory.tasks.length),
      category: miscCategory.category,
      percentage: miscCategory.percentage
    };
  }
  
  // Fallback if no miscellaneous category found
  return {
    amount: Math.round(totalBudget * 0.03), // Allocate 3% as default
    category: 'Other Expenses',
    percentage: 3
  };
};
