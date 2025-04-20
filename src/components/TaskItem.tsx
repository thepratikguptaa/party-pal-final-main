
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getVendorsForTask } from "@/services/justDialService";
import { Loader2, Phone, Mail, MapPin, Star, Globe, Clock, DollarSign, IndianRupee, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { getBudgetForTask, formatCurrency } from "@/utils/budgetUtils";

interface TaskItemProps {
  id: number;
  title: string;
  dueDate: string;
  eventId: number;
  eventTitle: string;
  completed?: boolean;
  onToggleComplete?: (id: number) => void;
  onRemove?: (id: number) => void;
}

export const TaskItem = ({
  id,
  title,
  dueDate,
  eventId,
  eventTitle,
  completed = false,
  onToggleComplete,
  onRemove,
}: TaskItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [taskBudget, setTaskBudget] = useState<{
    amount: number;
    category: string;
    percentage: number;
  } | null>(null);

  const handleGetVendors = async () => {
    if (vendors.length > 0) {
      setIsExpanded(!isExpanded);
      return;
    }

    setIsLoading(true);
    try {
      // Extract task type from the title for API query
      const taskType = title.split(" ").pop() || title;

      // Get event details to get location information
      const storedEvents = localStorage.getItem("events");
      let userLocation;
      let locationAddress;
      let eventType = "other";
      let totalBudget = 0;
      let guestCount = 50;

      if (storedEvents) {
        const events = JSON.parse(storedEvents);
        const event = events.find((e: any) => e.id === eventId);
        if (event) {
          if (event.locationCoords) {
            userLocation = event.locationCoords;
            locationAddress = event.location;
          }

          // Get budget information
          if (event.budget) {
            totalBudget = parseInt(event.budget.replace(/[^\d]/g, ""), 10) || 0;
          }

          // Get event type from title or use default
          const titleLower = event.title.toLowerCase();
          if (titleLower.includes("wedding")) eventType = "wedding";
          else if (titleLower.includes("corporate") || titleLower.includes("conference")) eventType = "corporate";
          else if (titleLower.includes("birthday")) eventType = "birthday";
          else if (titleLower.includes("social") || titleLower.includes("party")) eventType = "social";

          // Get guest count
          guestCount = event.guestCount || 50;

          // Calculate budget allocation for this task
          if (totalBudget > 0) {
            const budgetInfo = getBudgetForTask(title, eventType, totalBudget, guestCount);
            setTaskBudget(budgetInfo);
          }
        }
      }

      // Pass location information to get location-specific vendors
      const response = await getVendorsForTask(taskType, userLocation, locationAddress);

      if (response.success) {
        setVendors(response.vendors);
        setIsExpanded(true);

        const locationInfo = locationAddress ? ` near ${locationAddress}` : "";
        toast(`Found ${response.vendors.length} vendors for "${title}"${locationInfo}`, {
          description: response.locationUsed
            ? `Results sorted by distance from ${response.locationUsed}`
            : "Vendor details loaded successfully",
        });
      } else {
        toast("Could not load vendors", {
          description: response.message || "Unknown error occurred",
        });
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast("Error", {
        description: "Failed to fetch vendor information",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-3">
      <div
        className={`flex items-center justify-between p-3 border rounded-lg transition-all cursor-pointer ${
          completed ? "bg-green-50 border-green-300 hover:bg-green-100" : "hover:border-party-300 hover:bg-gray-50"
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label={`${title} task details`}
      >
        <div className="flex items-center gap-3 flex-1">
          <input
            type="checkbox"
            checked={completed}
            onChange={(e) => {
              e.stopPropagation();
              onToggleComplete && onToggleComplete(id);
            }}
            className="cursor-pointer w-4 h-4 rounded border-gray-400"
            aria-label={`Mark task "${title}" as ${completed ? "incomplete" : "complete"}`}
          />
          <div className="flex flex-col flex-1">
            <span className={`font-medium ${completed ? "line-through text-gray-500" : ""}`}>{title}</span>
            <span className="text-sm text-gray-500">Due: {dueDate}</span>
            <div className="text-xs text-gray-400">For: {eventTitle}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {taskBudget && (
            <div className="text-xs flex items-center text-party-600 font-medium select-none">
              <IndianRupee className="h-4 w-4 mr-1" />
              <span>Budget: {formatCurrency(taskBudget.amount)}</span>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={(e) => {
              e.stopPropagation();
              handleGetVendors();
            }}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : `${isExpanded ? "Hide" : "Show"} Vendors`}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 text-red-600 hover:bg-red-100"
            onClick={(e) => {
              e.stopPropagation();
              onRemove && onRemove(id);
            }}
            aria-label={`Remove task ${title}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isExpanded && vendors.length > 0 && (
        <div className="mt-2 ml-7 space-y-3 text-sm">
          {vendors.map((vendor, index) => (
            <div key={`vendor-${index}`} className="p-4 rounded-lg bg-gray-50 border hover:shadow-md transition-all">
              <div className="flex justify-between">
                <div className="font-medium text-md">{vendor.name}</div>
                <div className="flex items-center text-xs text-gray-600">
                  <Star className="h-3 w-3 text-amber-500 mr-1" fill="currentColor" />
                  <span>{vendor.rating}/5.0</span>
                  {vendor.reviews && <span className="ml-1 text-gray-400">({vendor.reviews} reviews)</span>}
                </div>
              </div>

              {vendor.distance && (
                <div className="mt-1 text-xs text-party-600 font-medium">{vendor.distance}</div>
              )}

              {vendor.services && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {vendor.services.map((service: string, sIdx: number) => (
                    <span
                      key={`service-${sIdx}`}
                      className="inline-flex text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-0.5"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Phone className="h-3 w-3 text-party-500" />
                    <a
                      href={`tel:${vendor.phone}`}
                      className="hover:text-party-600 underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {vendor.phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Mail className="h-3 w-3 text-party-500" />
                    <a
                      href={`mailto:${vendor.email}`}
                      className="hover:text-party-600 underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {vendor.email}
                    </a>
                  </div>

                  {vendor.address && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <MapPin className="h-3 w-3 text-party-500" />
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(vendor.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-party-600 underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {vendor.address}
                      </a>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {vendor.website && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Globe className="h-3 w-3 text-party-500" />
                      <a
                        href={`https://${vendor.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-party-600 underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {vendor.website}
                      </a>
                    </div>
                  )}

                  {vendor.years_in_business && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Clock className="h-3 w-3 text-party-500" />
                      <span>{vendor.years_in_business} years in business</span>
                    </div>
                  )}

                  {vendor.price_range && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <DollarSign className="h-3 w-3 text-party-500" />
                      <span>Price range: {vendor.price_range}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
