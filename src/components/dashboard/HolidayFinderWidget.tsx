
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
  const [year, setYear] = useState('');
  const [holidays, setHolidays] = useState<HolidayLookupOutput['holidays'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedLocation, setSearchedLocation] = useState('');
  const [searchedYear, setSearchedYear] = useState('');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      setError("Please enter a location.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setHolidays(null);
    setSearchedLocation(location);
    setSearchedYear(year);

    try {
      const result = await holidayLookup({ location: location.trim(), year: year.trim() || undefined });
      if (result && result.holidays) {
        setHolidays(result.holidays);
      } else {
        setHolidays([]); // Set to empty array to indicate no holidays found vs. an error
      }
    } catch (err) {
      console.error("Holiday lookup error:", err);
      setError("Failed to fetch holidays. Please try again or check your network connection.");
      setHolidays(null);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="location">Location</Label>
            <Input 
              id="location" 
              type="text" 
              value={location} 
              onChange={e => setLocation(e.target.value)} 
              placeholder="e.g., Paris, France" 
              disabled={isLoading}
              required
            />
          </div>
          <div>
            <Label htmlFor="year">Year (Optional)</Label>
            <Input 
              id="year" 
              type="text" 
              value={year} 
              onChange={e => setYear(e.target.value)} 
              placeholder="e.g., 2024" 
              disabled={isLoading}
            />
          </div>
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

      {holidays && !isLoading && !error && (
        holidays.length > 0 ? (
          <ScrollArea className="h-60 border rounded-md p-1 bg-muted/20">
            <h3 className="text-sm font-medium my-2 text-muted-foreground px-3">
              Public Holidays in {searchedLocation}
              {searchedYear ? ` for ${searchedYear}` : ' (upcoming)'}:
            </h3>
            <ul className="space-y-1 p-2">
              {holidays.map((holiday, index) => (
                <li key={index} className="p-2 rounded hover:bg-muted">
                  <p className="font-semibold text-foreground">{holiday.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {holiday.date ? format(parseISO(holiday.date), 'EEEE, MMMM do, yyyy') : 'Date not available'}
                  </p>
                </li>
              ))}
            </ul>
          </ScrollArea>
        ) : (
           <p className="text-center text-muted-foreground p-4">
             No public holidays found for {searchedLocation}
             {searchedYear ? ` in ${searchedYear}` : ' in the upcoming months'}.
           </p>
        )
      )}
    </div>
  );
}
