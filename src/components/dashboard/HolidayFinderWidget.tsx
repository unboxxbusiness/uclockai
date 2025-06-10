"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { holidayLookup, type HolidayLookupOutput } from '@/ai/flows/holiday-lookup';
import { Loader2, CalendarDays, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';

export default function HolidayFinderWidget() {
  const [location, setLocation] = useState('');
  const [holidays, setHolidays] = useState<HolidayLookupOutput['holidays'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      setError("Please enter a location.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setHolidays(null);
    try {
      const result = await holidayLookup({ location });
      if (result && result.holidays) {
        setHolidays(result.holidays);
      } else {
        setError("No holidays found or unexpected response.");
      }
    } catch (err) {
      console.error("Holiday lookup error:", err);
      setError("Failed to fetch holidays. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="location">Location</Label>
          <Input 
            id="location" 
            type="text" 
            value={location} 
            onChange={e => setLocation(e.target.value)} 
            placeholder="e.g., Paris, France or Tokyo, Japan" 
            disabled={isLoading}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarDays className="mr-2 h-4 w-4" />}
          Find Holidays
        </Button>
      </form>

      {error && (
        <div className="text-destructive p-3 bg-destructive/10 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" /> 
          {error}
        </div>
      )}

      {holidays && holidays.length > 0 && (
        <ScrollArea className="h-60 border rounded-md p-1 bg-muted/20">
           <h3 className="text-sm font-medium my-2 text-muted-foreground px-3">Upcoming Holidays in {location}:</h3>
          <ul className="space-y-1 p-2">
            {holidays.map((holiday, index) => (
              <li key={index} className="p-2 rounded hover:bg-muted">
                <p className="font-semibold text-foreground">{holiday.name}</p>
                <p className="text-sm text-muted-foreground">
                  {format(parseISO(holiday.date), 'EEEE, MMMM do, yyyy')}
                </p>
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
      {holidays && holidays.length === 0 && !isLoading && !error &&(
         <p className="text-center text-muted-foreground p-4">No upcoming holidays found for {location}.</p>
      )}
    </div>
  );
}
