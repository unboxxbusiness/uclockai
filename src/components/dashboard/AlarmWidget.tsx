"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, AlarmClock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parse } from 'date-fns';

interface Alarm {
  id: string;
  time: string; // HH:mm format
  label: string;
  isActive: boolean;
}

export default function AlarmWidget() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [newAlarmTime, setNewAlarmTime] = useState(''); // Default to current time or empty
  const [newAlarmLabel, setNewAlarmLabel] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Load alarms from localStorage
    const storedAlarms = localStorage.getItem('uclock-alarms');
    if (storedAlarms) {
      setAlarms(JSON.parse(storedAlarms));
    }
    // Set initial time for new alarm input to current time
    const now = new Date();
    setNewAlarmTime(format(now, 'HH:mm'));
  }, []);

  useEffect(() => {
    // Save alarms to localStorage
    localStorage.setItem('uclock-alarms', JSON.stringify(alarms));
  }, [alarms]);

  useEffect(() => {
    const checkAlarmsInterval = setInterval(() => {
      const now = new Date();
      const currentTimeFormatted = format(now, 'HH:mm');
      
      alarms.forEach(alarm => {
        if (alarm.isActive && alarm.time === currentTimeFormatted) {
          toast({
            title: `🚨 Alarm: ${alarm.label || 'Untitled Alarm'}`,
            description: `It's ${alarm.time}!`,
            duration: 10000, // Show for 10 seconds
          });
          // Simple alert for now as browser audio policies are restrictive
          alert(`Alarm: ${alarm.label || 'Untitled Alarm'} at ${alarm.time}`);
          // Deactivate alarm after it rings to prevent repeated alerts in the same minute
          toggleAlarmActive(alarm.id, false);
        }
      });
    }, 1000 * 30); // Check every 30 seconds

    return () => clearInterval(checkAlarmsInterval);
  }, [alarms, toast]);

  const handleAddAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlarmTime) {
      toast({ title: "Error", description: "Please set a time for the alarm.", variant: "destructive" });
      return;
    }
    
    // Validate time format
    try {
      parse(newAlarmTime, 'HH:mm', new Date());
    } catch (error) {
      toast({ title: "Error", description: "Invalid time format. Use HH:mm.", variant: "destructive" });
      return;
    }

    const newAlarm: Alarm = {
      id: Date.now().toString(),
      time: newAlarmTime,
      label: newAlarmLabel || 'Untitled Alarm',
      isActive: true,
    };
    setAlarms(prev => [...prev, newAlarm].sort((a,b) => a.time.localeCompare(b.time)));
    setNewAlarmTime(format(new Date(), 'HH:mm')); // Reset to current time for next input
    setNewAlarmLabel('');
    toast({ title: "Alarm Set", description: `Alarm "${newAlarm.label}" set for ${newAlarm.time}.`});
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms(prev => prev.filter(alarm => alarm.id !== id));
    toast({ title: "Alarm Removed", variant: "destructive" });
  };

  const toggleAlarmActive = (id: string, forceState?: boolean) => {
    setAlarms(prev =>
      prev.map(alarm =>
        alarm.id === id ? { ...alarm, isActive: forceState !== undefined ? forceState : !alarm.isActive } : alarm
      )
    );
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAddAlarm} className="space-y-3 p-1 border-b pb-4 mb-4">
        <div className="flex gap-3 items-end">
          <div className="flex-grow">
            <Label htmlFor="alarmTime">Time (HH:mm)</Label>
            <Input 
              id="alarmTime" 
              type="time" 
              value={newAlarmTime} 
              onChange={e => setNewAlarmTime(e.target.value)} 
              required 
            />
          </div>
          <div className="flex-grow">
            <Label htmlFor="alarmLabel">Label</Label>
            <Input 
              id="alarmLabel" 
              type="text" 
              value={newAlarmLabel} 
              onChange={e => setNewAlarmLabel(e.target.value)} 
              placeholder="e.g., Wake up"
            />
          </div>
        </div>
        <Button type="submit" className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Alarm
        </Button>
      </form>

      {alarms.length === 0 && (
        <p className="text-center text-muted-foreground py-4">No alarms set.</p>
      )}

      {alarms.length > 0 && (
        <ScrollArea className="h-48">
          <ul className="space-y-2">
            {alarms.map(alarm => (
              <li 
                key={alarm.id} 
                className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                  alarm.isActive ? 'bg-accent/20 hover:bg-accent/30' : 'bg-muted/50 hover:bg-muted'
                }`}
              >
                <div onClick={() => toggleAlarmActive(alarm.id)} className="cursor-pointer flex-grow">
                  <p className={`text-lg font-semibold ${alarm.isActive ? 'text-accent-foreground' : 'text-muted-foreground line-through'}`}>
                    {alarm.time}
                  </p>
                  <p className={`text-sm ${alarm.isActive ? 'text-accent-foreground/80' : 'text-muted-foreground/80 line-through'}`}>
                    {alarm.label}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteAlarm(alarm.id)} className="text-destructive hover:text-destructive/80">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}
    </div>
  );
}
