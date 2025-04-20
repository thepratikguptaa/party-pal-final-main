
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  calculateBudgetAllocations, 
  formatCurrency, 
  BudgetAllocation 
} from "@/utils/budgetUtils";
import { Progress } from "@/components/ui/progress";
import { IndianRupee } from "lucide-react";

interface BudgetAllocationSectionProps {
  eventType: string;
  budget: string;
  guestCount: number;
}

export function BudgetAllocationSection({ 
  eventType, 
  budget, 
  guestCount 
}: BudgetAllocationSectionProps) {
  const [allocations, setAllocations] = useState<BudgetAllocation[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  // Parse budget string to number
  const parseBudget = (budgetStr: string): number => {
    // Remove currency symbol and commas, convert to number
    return parseInt(budgetStr.replace(/[^\d]/g, ''), 10) || 0;
  };
  
  useEffect(() => {
    // Calculate budget allocations whenever inputs change
    const budgetAmount = parseBudget(budget);
    if (budgetAmount > 0) {
      const calculated = calculateBudgetAllocations(eventType, budgetAmount, guestCount);
      setAllocations(calculated);
    } else {
      setAllocations([]);
    }
  }, [eventType, budget, guestCount]);
  
  // Get total budget
  const totalBudget = parseBudget(budget);
  
  // Toggle expanded category
  const toggleCategory = (category: string) => {
    if (expandedCategory === category) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(category);
    }
  };
  
  if (totalBudget <= 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Budget Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            Please set a budget for your event to see allocations.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Color palette for the different categories
  const categoryColors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
    'bg-amber-500', 'bg-rose-500', 'bg-cyan-500',
    'bg-emerald-500', 'bg-pink-500', 'bg-indigo-500'
  ];
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <IndianRupee className="h-5 w-5 mr-1 text-party-500" />
          Budget Allocation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Total Budget */}
        <div className="mb-6 p-4 bg-party-50 rounded-lg border border-party-100">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Total Budget:</span>
            <span className="text-lg font-semibold text-party-700">
              {formatCurrency(totalBudget)}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Recommended allocation for {guestCount} guests
          </div>
        </div>
        
        {/* Budget Categories */}
        <div className="space-y-4">
          {allocations.map((allocation, index) => (
            <div key={allocation.category} className="border rounded-lg overflow-hidden">
              <div 
                className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleCategory(allocation.category)}
              >
                <div className="flex justify-between items-center">
                  <div className="font-medium">{allocation.category}</div>
                  <div className="font-medium">{formatCurrency(allocation.amount)}</div>
                </div>
                <div className="mt-2 mb-1 flex items-center justify-between text-xs text-gray-600">
                  <span>{allocation.percentage}% of total budget</span>
                  <span>{allocation.tasks.length} tasks</span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div 
                    className={`absolute h-full ${categoryColors[index % categoryColors.length]} transition-all`}
                    style={{ width: `${allocation.percentage}%` }}
                  />
                </div>
              </div>
              
              {/* Expanded view with tasks */}
              {expandedCategory === allocation.category && (
                <div className="bg-gray-50 p-3 border-t">
                  <div className="text-sm font-medium mb-2">Task Breakdown:</div>
                  <div className="space-y-3">
                    {allocation.tasks.map((task, taskIndex) => (
                      <div key={taskIndex} className="flex justify-between text-sm">
                        <div>{task.name}</div>
                        <div>{formatCurrency(task.amount)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          <p>* Budget allocations are recommendations and can be adjusted based on your priorities.</p>
        </div>
      </CardContent>
    </Card>
  );
}
