
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTimezones, type TimezoneOption } from '@/lib/timezones';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ClockItem {
  id: string;
  timezone: string;
}

export default function ClockWidget() {
  const [clocks, setClocks] = useState<ClockItem[]>([]);
  const [newTimezoneToAdd, setNewTimezoneToAdd] = useState<string>('');
  const [liveTime, setLiveTime] = useState(new Date());
  const { toast } = useToast();

  const timezones = useMemo(() => getTimezones(), []);

  useEffect(() => {
    // Load clocks from localStorage
    let initialClocks: ClockItem[];
    try {
      const storedClocks = localStorage.getItem('uclock-world-clocks');
      if (storedClocks) {
        const parsedClocks = JSON.parse(storedClocks);
        // Basic validation
        if (Array.isArray(parsedClocks) && parsedClocks.every(c => typeof c.id === 'string' && typeof c.timezone === 'string')) {
          initialClocks = parsedClocks;
        } else {
          console.warn('Invalid clock data in localStorage, resetting.');
          initialClocks = [];
        }
      } else {
        initialClocks = [];
      }
    } catch (error) {
      console.error('Error parsing clocks from localStorage:', error);
      initialClocks = [];
    }

    if (initialClocks.length === 0) {
      try {
        const userLocalTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        initialClocks = [{ id: 'default-local-' + Date.now(), timezone: userLocalTimezone }];
      } catch (e) {
        console.warn("Could not get user's local timezone, defaulting to UTC.");
        initialClocks = [{ id: 'default-utc-' + Date.now(), timezone: 'UTC' }];
      }
    }
    setClocks(initialClocks);

    // Set initial value for the "Add Timezone" select
    if (timezones.length > 0) {
      const firstAvailableTimezone = timezones.find(tz => !initialClocks.some(c => c.timezone === tz.value));
      setNewTimezoneToAdd(firstAvailableTimezone ? firstAvailableTimezone.value : (timezones[0]?.value || ''));
    }
  }, [timezones]); // timezones is stable, only runs on mount

  useEffect(() => {
    // Save clocks to localStorage whenever they change
    // Only save if clocks array is not empty or if it was previously populated from localStorage
    if (clocks.length > 0 || localStorage.getItem('uclock-world-clocks') !== null) {
        localStorage.setItem('uclock-world-clocks', JSON.stringify(clocks));
    }
  }, [clocks]);

  useEffect(() => {
    // Update liveTime every second
    const intervalId = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleAddClock = () => {
    if (!newTimezoneToAdd) {
      toast({ title: "Select a timezone", description: "Please select a timezone to add.", variant: "destructive" });
      return;
    }
    if (clocks.some(clock => clock.timezone === newTimezoneToAdd)) {
      toast({ title: "Timezone Exists", description: `${newTimezoneToAdd.replace(/_/g, ' ')} is already in your list.`, variant: "default" });
      return;
    }
    setClocks(prevClocks => [...prevClocks, { id: Date.now().toString(), timezone: newTimezoneToAdd }]);
    toast({ title: "Clock Added", description: `${newTimezoneToAdd.replace(/_/g, ' ')} added to your world clocks.` });

    // Select next available timezone in dropdown
     if (timezones.length > 0) {
       const currentIndex = timezones.findIndex(tz => tz.value === newTimezoneToAdd);
       let nextIndex = (currentIndex + 1) % timezones.length;
       let attempts = 0;
       // Try to find next non-added timezone
       while(clocks.some(c => c.timezone === timezones[nextIndex].value) && attempts < timezones.length) {
         nextIndex = (nextIndex + 1) % timezones.length;
         attempts++;
       }
       if (!clocks.some(c => c.timezone === timezones[nextIndex].value) || attempts >= timezones.length) {
         setNewTimezoneToAdd(timezones[nextIndex].value);
       } else {
         // If all are added or only one timezone is available and added
         const firstNonAdded = timezones.find(tz => !clocks.some(c => c.timezone === tz.value) && tz.value !== newTimezoneToAdd);
         setNewTimezoneToAdd(firstNonAdded ? firstNonAdded.value : '');
       }
    }
  };

  const handleRemoveClock = (idToRemove: string) => {
    const clockToRemove = clocks.find(c => c.id === idToRemove);
    setClocks(prevClocks => prevClocks.filter(clock => clock.id !== idToRemove));
    if (clockToRemove){
        toast({ title: "Clock Removed", description: `${clockToRemove.timezone.replace(/_/g, ' ')} removed.`, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row items-end gap-2 p-1 border-b pb-4">
        <div className="flex-grow w-full sm:w-auto">
          <Label htmlFor="new-timezone-select" className="text-sm font-medium">Add New Clock</Label>
          <Select value={newTimezoneToAdd} onValueChange={setNewTimezoneToAdd}>
            <SelectTrigger id="new-timezone-select" className="w-full mt-1">
              <SelectValue placeholder="Select timezone to add" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {timezones.map((tz: TimezoneOption) => (
                <SelectItem key={tz.value} value={tz.value} disabled={clocks.some(c => c.timezone === tz.value)}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAddClock} variant="outline" className="w-full sm:w-auto shrink-0">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Clock
        </Button>
      </div>

      {clocks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clocks.map(clockItem => (
            <Card key={clockItem.id} className="shadow-md rounded-lg flex flex-col overflow-hidden bg-card/80 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3 px-4 border-b">
                <CardTitle className="text-base font-semibold text-foreground truncate" title={clockItem.timezone.replace(/_/g, ' ')}>
                  {clockItem.timezone.replace(/_/g, ' ')}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveClock(clockItem.id)} className="text-muted-foreground hover:text-destructive -mr-2">
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove clock</span>
                </Button>
              </CardHeader>
              <CardContent className="p-4 text-center flex flex-col items-center justify-center flex-grow">
                <div className="text-4xl font-bold text-primary tabular-nums tracking-tight">
                  {liveTime.toLocaleTimeString('en-US', { timeZone: clockItem.timezone, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {liveTime.toLocaleDateString('en-US', { timeZone: clockItem.timezone, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-10">
          <p className="text-lg mb-2">No clocks added yet.</p>
          <p className="text-sm">Select a timezone from the dropdown above and click "Add Clock" to display a world clock.</p>
        </div>
      )}
    </div>
  );
}
