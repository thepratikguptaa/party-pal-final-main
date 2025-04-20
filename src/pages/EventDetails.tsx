
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TaskItem } from "@/components/TaskItem";
import { MessageSquare, ArrowLeft, IndianRupee } from "lucide-react";
import WeatherForecast from "@/components/WeatherForecast";
import { BudgetAllocationSection } from "@/components/BudgetAllocationSection";
import { VenueDetailsCard } from "@/components/VenueDetailsCard";

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  progress: number;
  guestCount?: number;
  description?: string;
  isFinished?: boolean;
  budget?: string;
  locationCoords?: { lat: number; lng: number };
  venue?: string;
  venuePlaceId?: string;
  venueCoords?: { lat: number; lng: number };
}

interface Task {
  id: number;
  title: string;
  dueDate: string;
  eventId: number;
  completed?: boolean;
}

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editEvent, setEditEvent] = useState<Partial<Event>>({
    title: "",
    date: "",
    location: "",
    guestCount: undefined,
  });

  useEffect(() => {
    const storedEvents = localStorage.getItem("events");
    if (storedEvents) {
      const events = JSON.parse(storedEvents);
      const foundEvent = events.find((e: Event) => e.id === Number(id));
      if (foundEvent) {
        setEvent(foundEvent);
        setEditEvent({
          title: foundEvent.title,
          date: foundEvent.date,
          location: foundEvent.location,
          guestCount: foundEvent.guestCount,
        });

        const eventTasks: Task[] = [];

        const titleLower = foundEvent.title.toLowerCase();
        const descLower = (foundEvent.description || "").toLowerCase();
        const locationLower = (foundEvent.location || "").toLowerCase();

        const hasKeyword = (keywords: string[]) =>
          keywords.some((kw) => titleLower.includes(kw) || descLower.includes(kw));

        if (hasKeyword(["holiday", "party", "celebration"])) {
          eventTasks.push(
            { id: 1, title: "Confirm catering order", dueDate: "Nov 25", eventId: foundEvent.id },
            { id: 2, title: "Send invitations", dueDate: "Nov 30", eventId: foundEvent.id },
            { id: 3, title: "Book photographer", dueDate: "Dec 10", eventId: foundEvent.id },
            { id: 4, title: "Select decorations", dueDate: "Dec 5", eventId: foundEvent.id },
            { id: 5, title: "Arrange transportation", dueDate: "Dec 8", eventId: foundEvent.id }
          );
        } else if (hasKeyword(["launch", "product launch"])) {
          eventTasks.push(
            { id: 1, title: "Finalize presentation slides", dueDate: "Dec 5", eventId: foundEvent.id },
            { id: 2, title: "Book venue", dueDate: "Nov 28", eventId: foundEvent.id },
            { id: 3, title: "Arrange decoration", dueDate: "Dec 15", eventId: foundEvent.id },
            { id: 4, title: "Schedule media coverage", dueDate: "Dec 1", eventId: foundEvent.id },
            { id: 5, title: "Prepare press kits", dueDate: "Dec 3", eventId: foundEvent.id }
          );
        } else if (hasKeyword(["wedding"])) {
          eventTasks.push(
            { id: 1, title: "Book wedding venue", dueDate: "Oct 10", eventId: foundEvent.id },
            { id: 2, title: "Hire photographer", dueDate: "Oct 15", eventId: foundEvent.id },
            { id: 3, title: "Send invites", dueDate: "Sep 30", eventId: foundEvent.id },
            { id: 4, title: "Arrange catering", dueDate: "Oct 20", eventId: foundEvent.id },
            { id: 5, title: "Arrange transportation", dueDate: "Oct 18", eventId: foundEvent.id }
          );
        } else if (hasKeyword(["birthday"])) {
          eventTasks.push(
            { id: 1, title: "Choose party theme", dueDate: "Nov 20", eventId: foundEvent.id },
            { id: 2, title: "Order cake and food", dueDate: "Nov 25", eventId: foundEvent.id },
            { id: 3, title: "Send birthday invites", dueDate: "Nov 15", eventId: foundEvent.id }
          );
        } else {
          if (descLower.includes("catering")) {
            eventTasks.push({ id: eventTasks.length + 1, title: "Confirm catering details", dueDate: "2 weeks before", eventId: foundEvent.id });
          }
          if (descLower.includes("vendor")) {
            eventTasks.push({ id: eventTasks.length + 1, title: "Confirm with vendors", dueDate: "1 week before", eventId: foundEvent.id });
          }
          if (descLower.includes("music") || descLower.includes("dj")) {
            eventTasks.push({ id: eventTasks.length + 1, title: "Book DJ or band", dueDate: "1 month before", eventId: foundEvent.id });
          }
          if (descLower.includes("transportation")) {
            eventTasks.push({ id: eventTasks.length + 1, title: "Arrange transportation", dueDate: "2 weeks before", eventId: foundEvent.id });
          }
          if (descLower.includes("photographer")) {
            eventTasks.push({ id: eventTasks.length + 1, title: "Hire photographer", dueDate: "3 weeks before", eventId: foundEvent.id });
          }
          if (eventTasks.length === 0) {
            eventTasks.push(
              { id: 1, title: "Finalize details", dueDate: "2 weeks before", eventId: foundEvent.id },
              { id: 2, title: "Confirm with vendors", dueDate: "1 week before", eventId: foundEvent.id }
            );
          }
        }

        setTasks(eventTasks.map((t) => ({ ...t, completed: false })));
      }
    }
  }, [id]);

  const handleSave = () => {
    if (!event) return;

    const updatedEvent = {
      ...event,
      title: editEvent.title || event.title,
      date: editEvent.date || event.date,
      location: editEvent.location || event.location,
      guestCount:
        typeof editEvent.guestCount === "number" ? editEvent.guestCount : event.guestCount,
    };

    setEvent(updatedEvent);

    const storedEvents = localStorage.getItem("events");
    if (storedEvents) {
      const events = JSON.parse(storedEvents) as Event[];
      const updatedEvents = events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e));
      localStorage.setItem("events", JSON.stringify(updatedEvents));
    }

    setIsEditing(false);
  };

  const toggleTaskComplete = (taskId: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const removeTask = (taskId: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
    setTasks((prev) => [
      ...prev,
      {
        id: newId,
        title: newTaskTitle,
        dueDate: newTaskDueDate || "TBD",
        eventId: event?.id || 0,
        completed: false,
      },
    ]);
    setNewTaskTitle("");
    setNewTaskDueDate("");
  };

  if (!event) {
    return <div>Event not found</div>;
  }

  const titleLower = event.title.toLowerCase();
  const descLower = (event.description || "").toLowerCase();
  const locationLower = (event.location || "").toLowerCase();

  const recommendations = [];
  const budget = event.budget
    ? parseInt(event.budget.replace(/[^\d]/g, ""), 10)
    : 0;
  const guestCount = event.guestCount || 50;

  if (budget > 0) {
    if (budget < 50000) {
      recommendations.push(
        `With a budget of ${event.budget}, focus on essentials and consider DIY options`
      );
    } else if (budget < 200000) {
      recommendations.push(
        `Your ${event.budget} budget allows for quality services - prioritize venue and food`
      );
    } else {
      recommendations.push(
        `With your premium budget of ${event.budget}, consider luxury upgrades and professional services`
      );
    }

    const perGuestBudget = Math.round(budget / (guestCount || 1));
    if (perGuestBudget < 1000) {
      recommendations.push(
        `Budget of ₹${perGuestBudget} per guest - consider buffet-style service to optimize costs`
      );
    } else if (perGuestBudget > 5000) {
      recommendations.push(
        `With ₹${perGuestBudget} per guest, you can offer premium dining and amenities`
      );
    }
  }

  if (
    titleLower.includes("holiday") ||
    descLower.includes("holiday") ||
    descLower.includes("party") ||
    descLower.includes("celebration")
  ) {
    recommendations.push(
      "Consider seasonal decorations to enhance the festive atmosphere",
      "Plan activities that encourage team bonding",
      "Include dietary options for all preferences"
    );
  }
  if (
    titleLower.includes("launch") ||
    descLower.includes("launch") ||
    descLower.includes("product launch")
  ) {
    recommendations.push(
      "Prepare product demonstration stations",
      "Schedule media coverage and press releases",
      "Set up networking opportunities"
    );
  }
  if (titleLower.includes("wedding") || descLower.includes("wedding")) {
    recommendations.push(
      "Ensure the venue has sufficient seating and amenities",
      "Coordinate with vendors for smooth logistics",
      "Plan a detailed timeline for ceremonial events"
    );
  }
  if (titleLower.includes("birthday") || descLower.includes("birthday")) {
    recommendations.push(
      "Arrange a kid-friendly zone if children are attending",
      "Plan engaging games and entertainment",
      "Order a customized birthday cake"
    );
  }

  if (descLower.includes("catering")) {
    recommendations.push("Confirm catering services early and finalize menu options");
  }
  if (descLower.includes("vendor")) {
    recommendations.push("Maintain clear communication and contracts with all vendors");
  }
  if (descLower.includes("music") || descLower.includes("dj")) {
    recommendations.push("Book professional DJs or live bands early");
  }
  if (descLower.includes("transportation")) {
    recommendations.push("Arrange reliable transportation for guests");
  }
  if (descLower.includes("photographer")) {
    recommendations.push("Hire a professional photographer to capture key moments");
  }

  if ((event.guestCount ?? 0) > 100) {
    recommendations.push("Hire extra staff to manage large guest list");
  }

  if (
    locationLower.includes("outdoor") ||
    descLower.includes("outdoor") ||
    locationLower.includes("park")
  ) {
    recommendations.push("Prepare a backup plan for weather changes or outdoor elements");
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Ensure clear communication with all vendors",
      "Prepare a backup plan for outdoor elements",
      "Consider guest accessibility needs"
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 px-6">
        <div className="container mx-auto">
          <Button
            variant="outline"
            className="mb-6"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>{event.title} - Plan It</CardTitle>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm text-party-500 hover:underline"
                    aria-label="Edit event details"
                    hidden={isEditing}
                  >
                    Edit
                  </button>
                </CardHeader>

                {isEditing ? (
                  <CardContent>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSave();
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label htmlFor="title" className="block text-gray-600 mb-1">
                          Event Name
                        </label>
                        <input
                          id="title"
                          type="text"
                          value={editEvent.title}
                          onChange={(e) => setEditEvent({ ...editEvent, title: e.target.value })}
                          className="w-full rounded border border-gray-300 p-2"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="date" className="block text-gray-600 mb-1">
                          Date
                        </label>
                        <input
                          id="date"
                          type="date"
                          value={editEvent.date}
                          onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })}
                          className="w-full rounded border border-gray-300 p-2"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="location" className="block text-gray-600 mb-1">
                          Location
                        </label>
                        <input
                          id="location"
                          type="text"
                          value={editEvent.location}
                          onChange={(e) => setEditEvent({ ...editEvent, location: e.target.value })}
                          className="w-full rounded border border-gray-300 p-2"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="guestCount" className="block text-gray-600 mb-1">
                          Guest Count
                        </label>
                        <input
                          id="guestCount"
                          type="number"
                          min="0"
                          value={editEvent.guestCount || ""}
                          onChange={(e) =>
                            setEditEvent({
                              ...editEvent,
                              guestCount: e.target.value === "" ? undefined : Number(e.target.value),
                            })
                          }
                          className="w-full rounded border border-gray-300 p-2"
                        />
                      </div>

                      <div className="flex gap-4">
                        <button
                          type="submit"
                          className="bg-party-500 text-white px-4 py-2 rounded hover:bg-party-600"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditEvent({
                              title: event.title,
                              date: event.date,
                              location: event.location,
                              guestCount: event.guestCount,
                            });
                            setIsEditing(false);
                          }}
                          className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </CardContent>
                ) : (
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Date:</span>
                        <span>{event.date}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Location:</span>
                        <span>{event.location}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Guest Count:</span>
                        <span>{event.guestCount || "Not specified"}</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`${
                            event.isFinished ? "bg-green-500" : "bg-party-500"
                          } h-full rounded-full`}
                          style={{ width: `${event.isFinished ? 100 : event.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Planning progress</span>
                        <span className="font-medium">{event.isFinished ? "100" : event.progress}%</span>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              <Card className="mt-8">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Tasks</CardTitle>
                  {event.budget && (
                    <div className="flex items-center text-sm text-party-600">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      <span>Event Budget: {event.budget}</span>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-4">
                    {tasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        id={task.id}
                        title={task.title}
                        dueDate={task.dueDate}
                        eventId={task.eventId}
                        eventTitle={event.title}
                        completed={task.completed}
                        onToggleComplete={toggleTaskComplete}
                        onRemove={removeTask}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="New task title"
                      className="flex-grow rounded border border-gray-300 p-2"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      aria-label="New task title"
                    />
                    <input
                      type="text"
                      placeholder="Due date (optional)"
                      className="w-32 rounded border border-gray-300 p-2"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      aria-label="New task due date"
                    />
                    <Button
                      className="bg-party-500 hover:bg-party-600"
                      onClick={addTask}
                      aria-label="Add new task"
                      disabled={!newTaskTitle.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <WeatherForecast eventDate={event.date} location={event.location} />
              
              <VenueDetailsCard 
                venue={event.venue} 
                venuePlaceId={event.venuePlaceId} 
                eventLocation={event.location} 
              />

              <Card className="bg-gradient-to-br from-party-600 to-party-800 text-white mt-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-white/20 rounded-full p-3">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">AI Recommendations</h3>
                      <div className="space-y-2 mt-2">
                        {recommendations.map((rec, idx) => (
                          <p key={idx} className="text-sm">
                            • {rec}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {event.budget && (
                <BudgetAllocationSection
                  eventType={
                    titleLower.includes("wedding")
                      ? "wedding"
                      : titleLower.includes("corporate")
                      ? "corporate"
                      : titleLower.includes("birthday")
                      ? "birthday"
                      : titleLower.includes("social")
                      ? "social"
                      : "other"
                  }
                  budget={event.budget}
                  guestCount={event.guestCount || 50}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

