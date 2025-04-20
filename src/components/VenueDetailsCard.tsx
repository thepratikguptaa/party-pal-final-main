
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlaceDetailsCard } from "@/components/PlaceDetailsCard";
import { MapPin, Building, ExternalLink } from "lucide-react";

interface VenueDetailsCardProps {
  venue?: string;
  venuePlaceId?: string;
  eventLocation: string;
}

export function VenueDetailsCard({ venue, venuePlaceId, eventLocation }: VenueDetailsCardProps) {
  if (!venue && !venuePlaceId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2 text-party-500" />
            Event Venue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 flex flex-col items-center">
            <p className="text-gray-500 mb-4">No venue selected for this event yet.</p>
            <p className="text-sm text-gray-600 mb-4">Event will be held at:</p>
            <div className="flex items-center justify-center text-party-600 font-medium">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{eventLocation}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (venue && !venuePlaceId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2 text-party-500" />
            Event Venue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <h3 className="font-medium text-xl mb-2">{venue}</h3>
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{eventLocation}</span>
            </div>

            <Button
              variant="outline"
              className="mt-2"
              onClick={() => {
                window.open(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`,
                  '_blank'
                );
              }}
            >
              <MapPin className="h-4 w-4 mr-2" />
              View on Maps
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building className="h-5 w-5 mr-2 text-party-500" />
          Event Venue
        </CardTitle>
      </CardHeader>
      <CardContent>
        {venuePlaceId && <PlaceDetailsCard placeId={venuePlaceId} />}
      </CardContent>
    </Card>
  );
}
