
"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Sun, CloudSun, Cloud, CloudRain, CloudSnow, CloudFog, CloudLightning, CloudDrizzle, Loader2, AlertTriangle } from 'lucide-react';

interface WeatherData {
  temperature: string;
  description: string;
  wind: string;
  forecast: { day: string; temperature: string; wind: string }[];
}

const getWeatherIcon = (description: string): JSX.Element => {
  const desc = description.toLowerCase();
  if (desc.includes("sunny") || desc.includes("clear")) return <Sun size={42} className="text-muted-foreground group-hover:text-primary transition-colors" />;
  if (desc.includes("partly cloudy")) return <CloudSun size={42} className="text-muted-foreground group-hover:text-primary transition-colors" />;
  if (desc.includes("cloudy") || desc.includes("overcast")) return <Cloud size={42} className="text-muted-foreground group-hover:text-primary transition-colors" />;
  if (desc.includes("rain") || desc.includes("shower")) return <CloudRain size={42} className="text-muted-foreground group-hover:text-primary transition-colors" />;
  if (desc.includes("drizzle")) return <CloudDrizzle size={42} className="text-muted-foreground group-hover:text-primary transition-colors" />;
  if (desc.includes("snow")) return <CloudSnow size={42} className="text-muted-foreground group-hover:text-primary transition-colors" />;
  if (desc.includes("fog") || desc.includes("mist")) return <CloudFog size={42} className="text-muted-foreground group-hover:text-primary transition-colors" />;
  if (desc.includes("thunderstorm") || desc.includes("lightning")) return <CloudLightning size={42} className="text-muted-foreground group-hover:text-primary transition-colors" />;
  return <Cloud size={42} className="text-muted-foreground group-hover:text-primary transition-colors" />; // Default icon
};

export default function SleekClockDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      setIsLoadingWeather(true);
      setWeatherError(null);
      // Fetch weather for a default city (e.g., London).
      // In a real app, you might use geolocation or allow user input.
      const city = "London"; 
      try {
        const response = await fetch(`https://goweather.herokuapp.com/weather/${city}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch weather: ${response.statusText}`);
        }
        const data: WeatherData = await response.json();
        if (!data.temperature || !data.description) {
            // The API sometimes returns empty forecast or inconsistent data
            if (data.forecast && data.forecast.length > 0 && data.forecast[0].temperature && data.description === "") {
                 // If description is empty but forecast has temp, construct a basic description
                 setWeather({ ...data, description: "Weather available" });
            } else {
                throw new Error("Incomplete weather data received.");
            }
        } else {
            setWeather(data);
        }
      } catch (error: any) {
        console.error("Weather fetch error:", error);
        setWeatherError(error.message || "Could not load weather data.");
        setWeather(null);
      } finally {
        setIsLoadingWeather(false);
      }
    };

    fetchWeather();
  }, []);

  const timeFormatted = format(currentTime, 'HH:mm:ss');
  const dateFormatted = format(currentTime, 'eeee, MMMM do, yyyy');

  return (
    <Card className="w-full shadow-xl rounded-2xl overflow-hidden bg-card text-card-foreground transition-colors duration-300 hover:shadow-2xl">
      <CardContent className="p-6 sm:p-8 md:p-10 flex flex-col items-center justify-center space-y-6 md:space-y-8">
        {/* Time */}
        <div className="text-center">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-primary tracking-tight tabular-nums">
            {timeFormatted.substring(0, 5)}
            <span className="text-4xl sm:text-5xl md:text-6xl text-primary/70 tabular-nums">
              {timeFormatted.substring(5)}
            </span>
          </h1>
        </div>

        {/* Date */}
        <div className="text-center">
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            {dateFormatted}
          </p>
        </div>

        {/* Weather Section */}
        <div className="w-full pt-6 md:pt-8 border-t border-border/50">
          {isLoadingWeather ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 size={36} className="animate-spin mb-2" />
              <p>Loading weather...</p>
            </div>
          ) : weatherError ? (
            <div className="flex flex-col items-center justify-center text-destructive">
              <AlertTriangle size={36} className="mb-2" />
              <p className="text-sm text-center">Weather Error: {weatherError}</p>
            </div>
          ) : weather ? (
            <div className="group flex flex-col sm:flex-row items-center justify-center sm:space-x-6 space-y-3 sm:space-y-0 text-center sm:text-left">
              <div className="text-muted-foreground">
                {getWeatherIcon(weather.description)}
              </div>
              <div className="flex flex-col">
                <p className="text-2xl md:text-3xl font-semibold text-foreground">{weather.temperature}</p>
                <p className="text-sm md:text-base text-muted-foreground capitalize">{weather.description}</p>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <p>Weather data not available.</p>
            </div>
          )}
           <p className="text-xs text-muted-foreground/70 text-center mt-4">
            {weather && !weatherError ? "Live weather for London (via goweather.herokuapp.com)" : "(Weather data service might be unavailable)"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
