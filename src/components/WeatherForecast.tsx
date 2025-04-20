
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { generateWeatherForecast, getWeatherIconUrl, WeatherDay } from "@/utils/weatherUtils";
import { Loader2 } from "lucide-react";

interface WeatherForecastProps {
  eventDate: string; // yyyy-MM-dd format expected
  location: string; // city or place name string to fetch weather
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({ eventDate, location }) => {
  const [weatherData, setWeatherData] = useState<WeatherDay[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!eventDate || !location) return;
    
    setLoading(true);
    
    // Small delay to simulate API call
    const timer = setTimeout(() => {
      try {
        // Format date to ensure consistency
        const formattedDate = eventDate.includes('T') 
          ? eventDate 
          : `${eventDate}T00:00:00.000Z`;
        
        // Generate weather forecast based on location and date
        const forecast = generateWeatherForecast(formattedDate, location);
        setWeatherData(forecast);
      } catch (error) {
        console.error("Error generating weather forecast:", error);
      } finally {
        setLoading(false);
      }
    }, 800);
    
    return () => clearTimeout(timer);
  }, [eventDate, location]);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Weather Forecast</span>
          <span className="text-sm font-normal text-gray-500">
            (3 days before and after event)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-party-500 mr-2" />
            <span>Loading weather forecast...</span>
          </div>
        )}
        
        {!loading && weatherData.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No weather data available for the selected location and date.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-7 gap-4">
          {weatherData.map((day) => {
            const dateObj = parseISO(day.date);
            const isEventDay = format(dateObj, 'yyyy-MM-dd') === eventDate.split('T')[0];
            
            return (
              <div
                key={day.date}
                className={`${
                  isEventDay 
                    ? 'bg-party-100 border-party-300 border' 
                    : 'bg-blue-50'
                } p-2 rounded text-center flex flex-col items-center`}
              >
                <div className="font-semibold">{format(dateObj, "EEE")}</div>
                <div className="text-sm">{format(dateObj, "MMM dd")}</div>
                {isEventDay && (
                  <div className="text-xs font-medium text-party-600 mb-1">EVENT DAY</div>
                )}
                <img
                  src={getWeatherIconUrl(day.icon)}
                  alt={day.description}
                  title={day.description}
                  className="mx-auto w-10 h-10"
                />
                <div className="text-xs capitalize">{day.description}</div>
                <div className="text-sm mt-1">
                  <span className="font-semibold">{Math.round(day.tempDay)}°C</span>{" "}
                  / <span>{Math.round(day.tempNight)}°C</span>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Weather forecast based on historical data for {location}.</p>
          <p>Plan accordingly as weather conditions may change.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherForecast;
