
"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { CloudSun } from 'lucide-react';

export default function SleekClockDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  const timeFormatted = format(currentTime, 'HH:mm:ss');
  const dateFormatted = format(currentTime, 'eeee, MMMM do, yyyy');

  // Placeholder weather data
  const weatherData = {
    icon: <CloudSun size={42} className="text-muted-foreground group-hover:text-primary transition-colors" />,
    temp: '23°C',
    description: 'Partly Cloudy',
  };

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

        {/* Weather Placeholder */}
        <div className="w-full pt-6 md:pt-8 border-t border-border/50">
          <div className="group flex flex-col sm:flex-row items-center justify-center sm:space-x-6 space-y-3 sm:space-y-0 text-center sm:text-left">
            <div className="text-muted-foreground">
              {weatherData.icon}
            </div>
            <div className="flex flex-col">
              <p className="text-2xl md:text-3xl font-semibold text-foreground">{weatherData.temp}</p>
              <p className="text-sm md:text-base text-muted-foreground">{weatherData.description}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/70 text-center mt-4">(Weather data is illustrative)</p>
        </div>
      </CardContent>
    </Card>
  );
}
