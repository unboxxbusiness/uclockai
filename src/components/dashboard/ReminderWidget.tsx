
"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Sparkles, Loader2, CheckCircle, Circle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { format, parseISO, set, getYear, getMonth, getDate, getHours, getMinutes, isPast, parse } from 'date-fns';
import { suggestReminder, type SuggestReminderOutput } from '@/ai/flows/suggest-reminder-flow';

interface Reminder {
  id: string;
  text: string;
  dateTime: string; // ISO string
  isCompleted: boolean;
  createdAt: string; // ISO string
}

const LOCAL_STORAGE_KEY = 'uclock-reminders';

export default function ReminderWidget() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [rawReminderIdea, setRawReminderIdea] = useState('');
  const [suggestedText, setSuggestedText] = useState('');
  const [finalReminderText, setFinalReminderText] = useState('');
  const [reminderDate, setReminderDate] = useState(''); // YYYY-MM-DD
  const [reminderTime, setReminderTime] = useState(''); // HH:mm
  
  const [isAISuggesting, setIsAISuggesting] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedReminders = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedReminders) {
      try {
        const parsedReminders: Reminder[] = JSON.parse(storedReminders);
        // Basic validation
        if (Array.isArray(parsedReminders) && parsedReminders.every(r => r.id && r.text && r.dateTime)) {
           setReminders(parsedReminders.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()));
        } else {
          setReminders([]);
        }
      } catch (error) {
        console.error("Error parsing reminders from localStorage", error);
        setReminders([]);
      }
    }
    // Set initial date/time for new reminder input to sensible defaults
    const now = new Date();
    setReminderDate(format(now, 'yyyy-MM-dd'));
    setReminderTime(format(now, 'HH:mm'));

  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    const checkRemindersInterval = setInterval(() => {
      const now = new Date();
      reminders.forEach(reminder => {
        if (!reminder.isCompleted && isPast(parseISO(reminder.dateTime)) && format(parseISO(reminder.dateTime), 'yyyy-MM-dd HH:mm') === format(now, 'yyyy-MM-dd HH:mm')) {
          toast({
            title: `🔔 Reminder: ${reminder.text}`,
            description: `It's time for your reminder scheduled at ${format(parseISO(reminder.dateTime), 'p')}.`,
            duration: 10000,
          });
          // Potentially play a sound or more advanced notification here
        }
      });
    }, 1000 * 30); // Check every 30 seconds

    return () => clearInterval(checkRemindersInterval);
  }, [reminders, toast]);

  const handleGetSuggestion = async () => {
    if (!rawReminderIdea.trim()) {
      setAiError("Please enter a reminder idea first.");
      return;
    }
    setIsAISuggesting(true);
    setAiError(null);
    setSuggestedText('');
    try {
      const result: SuggestReminderOutput = await suggestReminder({ userInput: rawReminderIdea });
      setSuggestedText(result.suggestedText);
      setFinalReminderText(result.suggestedText); // Pre-fill the final text input
    } catch (error: any) {
      console.error("AI suggestion error:", error);
      setAiError(error.message || "Failed to get suggestion. Please try again.");
      setSuggestedText(''); // Clear any previous suggestion
    }
    setIsAISuggesting(false);
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalReminderText.trim()) {
      toast({ title: "Error", description: "Reminder text cannot be empty.", variant: "destructive" });
      return;
    }
    if (!reminderDate || !reminderTime) {
      toast({ title: "Error", description: "Please set a valid date and time.", variant: "destructive" });
      return;
    }

    let combinedDateTime: Date;
    try {
        const parsedDate = parse(reminderDate, 'yyyy-MM-dd', new Date());
        const [hours, minutes] = reminderTime.split(':').map(Number);
        combinedDateTime = set(parsedDate, { hours, minutes, seconds: 0, milliseconds: 0 });

        if (isNaN(combinedDateTime.getTime())) {
          throw new Error("Invalid date or time components");
        }
    } catch (error) {
        toast({ title: "Error", description: "Invalid date or time format. Use YYYY-MM-DD and HH:mm.", variant: "destructive" });
        return;
    }
    
    if (isPast(combinedDateTime) && format(combinedDateTime, 'yyyy-MM-dd HH:mm') !== format(new Date(), 'yyyy-MM-dd HH:mm')) {
      toast({ title: "Warning", description: "The reminder time is in the past.", variant: "default" });
    }

    const newReminder: Reminder = {
      id: Date.now().toString(),
      text: finalReminderText.trim(),
      dateTime: combinedDateTime.toISOString(),
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    setReminders(prev => [...prev, newReminder].sort((a,b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()));
    
    // Reset form fields
    setRawReminderIdea('');
    setSuggestedText('');
    setFinalReminderText('');
    const now = new Date();
    setReminderDate(format(now, 'yyyy-MM-dd')); // Reset to current date
    setReminderTime(format(now, 'HH:mm'));       // Reset to current time
    setAiError(null);

    toast({ title: "Reminder Set", description: `"${newReminder.text}" scheduled for ${format(combinedDateTime, 'Pp')}.` });
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
    toast({ title: "Reminder Removed", variant: "destructive" });
  };

  const toggleReminderCompletion = (id: string) => {
    setReminders(prev =>
      prev.map(reminder =>
        reminder.id === id ? { ...reminder, isCompleted: !reminder.isCompleted } : reminder
      ).sort((a,b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    );
  };

  const activeReminders = reminders.filter(r => !r.isCompleted);
  const completedReminders = reminders.filter(r => r.isCompleted);

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddReminder} className="space-y-4 border-b pb-6">
        <div>
          <Label htmlFor="rawReminderIdea">What do you want to be reminded of?</Label>
          <Textarea 
            id="rawReminderIdea"
            value={rawReminderIdea}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
              setRawReminderIdea(e.target.value);
              setSuggestedText(''); // Clear suggestion if user types new idea
              setFinalReminderText(e.target.value); // Keep final text in sync initially
            }}
            placeholder="e.g., Pick up groceries after work tomorrow"
            rows={2}
            className="mt-1"
          />
        </div>
        <Button type="button" onClick={handleGetSuggestion} disabled={isAISuggesting || !rawReminderIdea.trim()} variant="outline" className="w-full sm:w-auto">
          {isAISuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Get Smart Suggestion
        </Button>

        {aiError && <p className="text-sm text-destructive">{aiError}</p>}

        {suggestedText && (
          <div className="p-3 bg-accent/10 rounded-md">
            <p className="text-sm font-medium text-accent-foreground">Suggested Reminder:</p>
            <p className="text-sm text-accent-foreground/90">{suggestedText}</p>
          </div>
        )}
        
        <div>
          <Label htmlFor="finalReminderText">Reminder Text</Label>
          <Textarea 
            id="finalReminderText"
            value={finalReminderText}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFinalReminderText(e.target.value)}
            placeholder="Enter or confirm reminder text"
            rows={2}
            required
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="reminderDate">Date</Label>
            <Input 
              id="reminderDate" 
              type="date" 
              value={reminderDate} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setReminderDate(e.target.value)} 
              required 
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="reminderTime">Time</Label>
            <Input 
              id="reminderTime" 
              type="time" 
              value={reminderTime} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setReminderTime(e.target.value)} 
              required 
              className="mt-1"
            />
          </div>
        </div>

        <Button type="submit" className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Reminder
        </Button>
      </form>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Active Reminders ({activeReminders.length})</h3>
        {activeReminders.length === 0 && <p className="text-sm text-muted-foreground">No active reminders.</p>}
        {activeReminders.length > 0 && (
          <ScrollArea className="h-48">
            <ul className="space-y-2">
              {activeReminders.map(reminder => (
                <li 
                  key={reminder.id} 
                  className="flex items-start justify-between p-3 rounded-md bg-card hover:bg-muted/50 transition-colors border"
                >
                  <div className="flex items-start space-x-3 flex-grow">
                    <Checkbox 
                      id={`reminder-${reminder.id}`}
                      checked={reminder.isCompleted} 
                      onCheckedChange={() => toggleReminderCompletion(reminder.id)}
                      className="mt-1 shrink-0"
                      aria-label={`Mark "${reminder.text}" as complete`}
                    />
                    <div>
                      <label htmlFor={`reminder-${reminder.id}`} className={`font-medium cursor-pointer ${reminder.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {reminder.text}
                      </label>
                      <p className={`text-xs ${reminder.isCompleted ? 'line-through text-muted-foreground/80' : 'text-muted-foreground'}`}>
                        {format(parseISO(reminder.dateTime), 'EEE, MMM d, yyyy @ h:mm a')}
                        {isPast(parseISO(reminder.dateTime)) && !reminder.isCompleted && <span className="text-destructive ml-1">(Past Due)</span>}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteReminder(reminder.id)} className="text-destructive hover:text-destructive/80 shrink-0 ml-2">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </div>
      
      {completedReminders.length > 0 && (
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-semibold text-muted-foreground">Completed Reminders ({completedReminders.length})</h3>
          <ScrollArea className="h-32">
            <ul className="space-y-2">
              {completedReminders.map(reminder => (
                <li 
                  key={reminder.id} 
                  className="flex items-start justify-between p-3 rounded-md bg-muted/30 hover:bg-muted/40 transition-colors border"
                >
                  <div className="flex items-start space-x-3 flex-grow">
                     <Checkbox 
                        id={`reminder-${reminder.id}-completed`}
                        checked={reminder.isCompleted} 
                        onCheckedChange={() => toggleReminderCompletion(reminder.id)}
                        className="mt-1 shrink-0"
                        aria-label={`Mark "${reminder.text}" as incomplete`}
                      />
                    <div>
                      <label htmlFor={`reminder-${reminder.id}-completed`} className="font-medium line-through text-muted-foreground cursor-pointer">
                        {reminder.text}
                      </label>
                      <p className="text-xs line-through text-muted-foreground/80">
                        Completed: {format(parseISO(reminder.dateTime), 'EEE, MMM d, yyyy @ h:mm a')}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteReminder(reminder.id)} className="text-destructive/70 hover:text-destructive/80 shrink-0 ml-2">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

