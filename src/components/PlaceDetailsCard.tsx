
import { useEffect, useState } from "react";
import { PlaceDetails, getPlaceDetails } from "@/utils/placeDetailsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, Phone, Globe, Star, Clock, AlertCircle, 
  ChevronDown, ChevronUp, ExternalLink, Loader2
} from "lucide-react";

interface PlaceDetailsCardProps {
  placeId: string;
  className?: string;
}

export function PlaceDetailsCard({ placeId, className = "" }: PlaceDetailsCardProps) {
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMorePhotos, setShowMorePhotos] = useState(false);
  const [expandHours, setExpandHours] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDetails = async () => {
      if (!placeId) {
        setError("No place ID provided");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const details = await getPlaceDetails(placeId);
        setPlaceDetails(details);
        setError(null);
      } catch (err) {
        console.error("Error fetching place details:", err);
        setError("Failed to load place details. Please try again later.");
        toast({
          title: "Error",
          description: "Could not load place details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [placeId, toast]);

  if (loading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
          <div className="flex flex-col items-center text-center">
            <Loader2 className="h-8 w-8 animate-spin text-party-500 mb-4" />
            <p className="text-gray-500">Loading place details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !placeDetails) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
            <p className="text-gray-700 font-medium">Error Loading Details</p>
            <p className="text-gray-500 mt-2">{error || "Please try again later"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Determine how many photos to show initially
  const initialPhotosToShow = 3;
  const displayPhotos = showMorePhotos 
    ? placeDetails.photos 
    : placeDetails.photos?.slice(0, initialPhotosToShow);

  // Format price level as $ symbols
  const formatPriceLevel = (level?: number) => {
    if (level === undefined) return "Price not available";
    const symbols = ["Free", "₹", "₹₹", "₹₹₹", "₹₹₹₹"];
    return symbols[level] || "Price not available";
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>{placeDetails.name}</span>
          {placeDetails.rating && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span className="font-medium">{placeDetails.rating}</span>
              {placeDetails.userRatingsTotal && (
                <span className="text-gray-500 text-xs">
                  ({placeDetails.userRatingsTotal} reviews)
                </span>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Address */}
        <div className="flex items-start">
          <MapPin className="h-4 w-4 text-party-500 mr-2 mt-0.5" />
          <span className="text-sm">{placeDetails.formattedAddress}</span>
        </div>
        
        {/* Contact info */}
        {placeDetails.formattedPhoneNumber && (
          <div className="flex items-center">
            <Phone className="h-4 w-4 text-party-500 mr-2" />
            <a 
              href={`tel:${placeDetails.formattedPhoneNumber}`} 
              className="text-sm text-party-600 hover:underline"
            >
              {placeDetails.formattedPhoneNumber}
            </a>
          </div>
        )}
        
        {/* Website */}
        {placeDetails.website && (
          <div className="flex items-center">
            <Globe className="h-4 w-4 text-party-500 mr-2" />
            <a 
              href={placeDetails.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-party-600 hover:underline flex items-center"
            >
              {new URL(placeDetails.website).hostname}
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        )}
        
        {/* Price level and types */}
        <div className="flex flex-wrap gap-2 mt-4">
          {placeDetails.priceLevel !== undefined && (
            <Badge variant="outline" className="bg-gray-50">
              {formatPriceLevel(placeDetails.priceLevel)}
            </Badge>
          )}
          
          {placeDetails.types?.slice(0, 3).map((type, index) => (
            <Badge key={index} variant="outline" className="bg-party-50 text-party-700 border-party-200">
              {type.replace(/_/g, ' ')}
            </Badge>
          ))}
        </div>
        
        {/* Opening hours */}
        {placeDetails.openingHours?.weekdayText && (
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full flex justify-between items-center"
              onClick={() => setExpandHours(!expandHours)}
            >
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-party-500" />
                <span>
                  {placeDetails.openingHours.isOpen ? "Open now" : "Closed now"}
                </span>
              </div>
              {expandHours ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            
            {expandHours && (
              <div className="mt-2 text-sm space-y-1 bg-gray-50 p-3 rounded-md">
                {placeDetails.openingHours.weekdayText.map((day, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="font-medium">{day.split(': ')[0]}:</span>
                    <span>{day.split(': ')[1]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Photos */}
        {displayPhotos && displayPhotos.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Photos</h3>
            <div className="grid grid-cols-3 gap-2">
              {displayPhotos.map((photo, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-md">
                  <img 
                    src={photo.url} 
                    alt={`${placeDetails.name} - photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            
            {(placeDetails.photos && placeDetails.photos.length > initialPhotosToShow) && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                onClick={() => setShowMorePhotos(!showMorePhotos)}
              >
                {showMorePhotos ? "Show Less" : `Show More (${placeDetails.photos.length - initialPhotosToShow} more)`}
                {showMorePhotos ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
              </Button>
            )}
          </div>
        )}
        
        {/* Attribution */}
        {placeDetails.photos && placeDetails.photos[0]?.htmlAttributions.length > 0 && (
          <div className="mt-4 text-xs text-gray-500">
            <div dangerouslySetInnerHTML={{ 
              __html: placeDetails.photos[0].htmlAttributions.join(' ') 
            }} />
          </div>
        )}
        
        {/* Map link */}
        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              window.open(
                `https://www.google.com/maps/search/?api=1&query=${placeDetails.location.lat},${placeDetails.location.lng}&query_place_id=${placeDetails.placeId}`,
                '_blank'
              );
            }}
          >
            <MapPin className="h-4 w-4 mr-2" />
            View on Google Maps
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
