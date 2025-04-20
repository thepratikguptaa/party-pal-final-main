
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Users, Clock, PlusCircle, ChevronRight, Trash2 } from "lucide-react";
import { IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  progress: number;
  guestCount?: number;
  isFinished?: boolean;
  budget?: string; // Make sure budget is optional
}

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const storedEvents = localStorage.getItem('events');
    const defaultEvents: Event[] = [
      {
        id: 1,
        title: "Company Holiday Party",
        date: "December 15, 2023",
        location: "Grand Ballroom",
        progress: 65
      },
      {
        id: 2,
        title: "Product Launch",
        date: "January 20, 2024",
        location: "Tech Conference Center",
        progress: 30
      }
    ];
    
    const parsedEvents = storedEvents ? [...JSON.parse(storedEvents), ...defaultEvents] : defaultEvents;
    setEvents(parsedEvents);
  }, []);

  const handleDeleteEvent = (eventId: number) => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    setEvents(updatedEvents);
    localStorage.setItem('events', JSON.stringify(updatedEvents));
    
    toast({
      title: "Event deleted",
      description: "The event has been successfully removed.",
    });
  };

  // Calculate total budget
  const totalBudget = events.reduce((sum, event) => {
    if (event.budget) {
      // Remove non-numeric characters and convert to number
      const budgetValue = parseInt(event.budget.replace(/[^0-9]/g, ''), 10) || 0;
      return sum + budgetValue;
    }
    return sum;
  }, 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening with your events.</p>
            </div>
            <Link to="/create-event">
              <Button className="mt-4 md:mt-0 bg-party-500 hover:bg-party-600 gap-2">
                <PlusCircle className="w-4 h-4" />
                Create New Event
              </Button>
            </Link>
          </div>
          
          {/* Stats overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { title: "Active Events", value: events.filter(e => !e.isFinished).length.toString(), icon: Calendar, color: "bg-blue-500" },
              { title: "Total Guests", value: events.reduce((sum, event) => sum + (event.guestCount || 0), 0).toString(), icon: Users, color: "bg-green-500" },
              { title: "Upcoming Deadlines", value: events.filter(e => !e.isFinished).length * 3, icon: Clock, color: "bg-amber-500" },
              { 
                title: "Budget Tracked", 
                value: totalBudget > 0 ? `₹${totalBudget.toLocaleString('en-IN')}` : "₹0", 
                icon: IndianRupee, 
                color: "bg-purple-500" 
              }
            ].map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6 flex items-center">
                  <div className={`${stat.color} rounded-full p-3 mr-4 text-white`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Events List */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center">
                <span>All Events</span>
                <Button variant="link" className="text-party-600 gap-1">
                  View all <ChevronRight className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div 
                      key={event.id}
                      className={`flex flex-col p-4 border rounded-lg hover:border-party-300 hover:shadow-sm transition-all ${event.isFinished ? 'bg-gray-50 opacity-80' : ''}`}
                    >
                      <div className="flex justify-between mb-2">
                        <h3 
                          className="font-semibold cursor-pointer hover:text-party-600" 
                          onClick={() => navigate(`/event/${event.id}`)}
                        >
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">{event.date}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEvent(event.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        <span>{event.location}</span>
                        {event.isFinished && <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">Completed</span>}
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`${event.isFinished ? 'bg-green-500' : 'bg-party-500'} h-full rounded-full`}
                          style={{ width: `${event.isFinished ? 100 : event.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs">
                        <span>Planning progress</span>
                        <span className="font-medium">{event.isFinished ? '100' : event.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No upcoming events yet</p>
                  <Button className="bg-party-500 hover:bg-party-600">
                    Create Your First Event
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
