"use client";

import { useState, useEffect, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTimezones, type TimezoneOption } from '@/lib/timezones';
import { CardDescription } from '@/components/ui/card';

export default function ClockWidget() {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState<string>(() => {
    // Initialize with user's local timezone
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
      return 'UTC'; // Fallback
    }
  });

  const timezones = useMemo(() => getTimezones(), []);

  useEffect(() => {
    const updateClock = () => {
      try {
        const now = new Date();
        setCurrentTime(now.toLocaleTimeString('en-US', { timeZone: selectedTimezone, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setCurrentDate(now.toLocaleDateString('en-US', { timeZone: selectedTimezone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
      } catch (error) {
        console.error("Error updating clock:", error);
        setCurrentTime("Invalid Timezone");
        setCurrentDate("");
      }
    };

    updateClock(); // Initial update
    const intervalId = setInterval(updateClock, 1000);
    return () => clearInterval(intervalId);
  }, [selectedTimezone]);

  return (
    <div className="space-y-4">
      <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select timezone" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {timezones.map((tz: TimezoneOption) => (
            <SelectItem key={tz.value} value={tz.value}>
              {tz.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="text-center">
        <div className="text-5xl font-bold text-primary tabular-nums tracking-tight">
          {currentTime || <span className="opacity-50">00:00:00</span>}
        </div>
        <CardDescription className="text-sm mt-1">{currentDate || "Select a timezone"}</CardDescription>
      </div>
    </div>
  );
}
