
"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Sun, CloudSun, Cloud, CloudFog, CloudRain, CloudDrizzle, CloudSnow, CloudLightning, Snowflake, Zap, Thermometer, Wind, Loader2, AlertTriangle } from 'lucide-react';

interface CurrentWeather {
  temperature: number;
  windspeed: number;
  weathercode: number;
  time: string;
  // Potentially other fields like is_day, winddirection, etc.
}

interface WeatherApiResponse {
  current_weather: CurrentWeather;
  // Other fields like latitude, longitude, timezone, etc.
}

interface WeatherInfo {
  description: string;
  Icon: React.ElementType;
}

const getWeatherInfoFromCode = (code: number): WeatherInfo => {
  switch (code) {
    case 0: return { description: "Clear sky", Icon: Sun };
    case 1: return { description: "Mainly clear", Icon: Sun };
    case 2: return { description: "Partly cloudy", Icon: CloudSun };
    case 3: return { description: "Overcast", Icon: Cloud };
    case 45: return { description: "Fog", Icon: CloudFog };
    case 48: return { description: "Depositing rime fog", Icon: CloudFog };
    case 51: return { description: "Light drizzle", Icon: CloudDrizzle };
    case 53: return { description: "Moderate drizzle", Icon: CloudDrizzle };
    case 55: return { description: "Dense drizzle", Icon: CloudDrizzle };
    case 56: return { description: "Light freezing drizzle", Icon: CloudDrizzle };
    case 57: return { description: "Dense freezing drizzle", Icon: CloudDrizzle };
    case 61: return { description: "Slight rain", Icon: CloudRain };
    case 63: return { description: "Moderate rain", Icon: CloudRain };
    case 65: return { description: "Heavy rain", Icon: CloudRain };
    case 66: return { description: "Light freezing rain", Icon: CloudRain };
    case 67: return { description: "Heavy freezing rain", Icon: CloudRain };
    case 71: return { description: "Slight snow fall", Icon: CloudSnow };
    case 73: return { description: "Moderate snow fall", Icon: CloudSnow };
    case 75: return { description: "Heavy snow fall", Icon: CloudSnow };
    case 77: return { description: "Snow grains", Icon: Snowflake };
    case 80: return { description: "Slight rain showers", Icon: CloudRain };
    case 81: return { description: "Moderate rain showers", Icon: CloudRain };
    case 82: return { description: "Violent rain showers", Icon: CloudRain };
    case 85: return { description: "Slight snow showers", Icon: CloudSnow };
    case 86: return { description: "Heavy snow showers", Icon: CloudSnow };
    case 95: return { description: "Thunderstorm", Icon: CloudLightning };
    case 96: return { description: "Thunderstorm with slight hail", Icon: Zap };
    case 99: return { description: "Thunderstorm with heavy hail", Icon: Zap };
    default: return { description: "Weather unavailable", Icon: Cloud };
  }
};


export default function SleekClockDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
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
      // Default to Delhi, India coordinates
      const latitude = 28.6139;
      const longitude = 77.2090;
      const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
      
      try {
        const response = await fetch(weatherApiUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch weather: ${response.status} ${response.statusText}`);
        }
        const data: WeatherApiResponse = await response.json();
        if (data && data.current_weather) {
          setWeather(data.current_weather);
        } else {
          throw new Error("Incomplete weather data received from Open-Meteo.");
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

  const timeFormatted = format(currentTime, 'hh:mm:ss a');
  const dateFormatted = format(currentTime, 'eeee, MMMM do, yyyy');
  
  const weatherInfo = weather ? getWeatherInfoFromCode(weather.weathercode) : null;
  const WeatherIcon = weatherInfo ? weatherInfo.Icon : Cloud;

  return (
    <Card className="w-full shadow-xl rounded-2xl overflow-hidden bg-card text-card-foreground transition-colors duration-300 hover:shadow-2xl">
      <CardContent className="p-6 sm:p-8 md:p-10 flex flex-col items-center justify-center space-y-6 md:space-y-8">
        {/* Time */}
        <div className="text-center">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-primary tracking-tight tabular-nums">
            {timeFormatted.substring(0, 8)} {/* hh:mm:ss */}
            <span className="text-4xl sm:text-5xl md:text-6xl text-primary/70 tabular-nums ml-1">
              {timeFormatted.substring(9)} {/* AM/PM */}
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
          ) : weather && weatherInfo ? (
            <div className="group flex flex-col items-center justify-center text-center">
              <div className="text-muted-foreground group-hover:text-primary transition-colors mb-2">
                <WeatherIcon size={42} />
              </div>
              <div className="flex flex-col items-center">
                <p className="text-2xl md:text-3xl font-semibold text-foreground">
                  {weather.temperature}°C
                </p>
                <p className="text-sm md:text-base text-muted-foreground capitalize">
                  {weatherInfo.description}
                </p>
                <p className="text-xs text-muted-foreground/80 mt-1">
                   Wind: {weather.windspeed} km/h
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <p>Weather data not available.</p>
            </div>
          )}
           <p className="text-xs text-muted-foreground/70 text-center mt-4">
            {weather && !weatherError ? "Live weather for Delhi, India" : "(Weather data service might be unavailable)"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
