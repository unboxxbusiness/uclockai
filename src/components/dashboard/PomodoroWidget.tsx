
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, SkipForward, Coffee, BookOpen, Briefcase } from 'lucide-react';
import { useInterval } from '@/hooks/useInterval';
import { useToast } from "@/hooks/use-toast";
import { Progress } from '@/components/ui/progress';

type Mode = 'pomodoro' | 'shortBreak' | 'longBreak';

interface ModeConfig {
  label: string;
  duration: number; // in seconds
  Icon: React.ElementType;
}

const MODES: Record<Mode, ModeConfig> = {
  pomodoro: { label: 'Pomodoro', duration: 25 * 60, Icon: Briefcase },
  shortBreak: { label: 'Short Break', duration: 5 * 60, Icon: Coffee },
  longBreak: { label: 'Long Break', duration: 15 * 60, Icon: BookOpen },
};

const LONG_BREAK_INTERVAL = 4; // Pomodoros before a long break

const formatTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function PomodoroWidget() {
  const [mode, setMode] = useState<Mode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(MODES.pomodoro.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Update timeLeft when mode changes and timer is not running
    if (!isRunning) {
      setTimeLeft(MODES[mode].duration);
    }
  }, [mode, isRunning]);

  useEffect(() => {
    // Update browser title with time left - This effect only runs on the client
    if (typeof window !== 'undefined') {
      if (isRunning) {
        document.title = `${formatTime(timeLeft)} - ${MODES[mode].label} | Uclock Ai`;
      } else {
        if (document.title !== `Uclock Ai - Smart Time Management`) {
          document.title = `Uclock Ai - Smart Time Management`;
        }
      }
      return () => {
      document.title = `Uclock Ai - Smart Time Management`;
      }; // Cleanup on unmount
    }
  }, [timeLeft, isRunning, mode]);


  const handleTimerEnd = useCallback(() => {
    setIsRunning(false);
    toast({
      title: `${MODES[mode].label} Finished!`,
      description: mode === 'pomodoro' ? `Time for a break!` : `Time to get back to focus!`,
    });

    // Send browser notification - This only runs on the client
    if (typeof window !== "undefined" && typeof Notification !== 'undefined' && Notification.permission === "granted") {
      new Notification(`${MODES[mode].label} Finished!`, {
        body: mode === 'pomodoro' ? `Time for a break!` : `Time to get back to focus!`,
        icon: '/favicon.ico' // Replace with your actual favicon path or a relevant icon URL
      });
    }


    if (mode === 'pomodoro') {
      const newPomodorosCompleted = pomodorosCompleted + 1;
      setPomodorosCompleted(newPomodorosCompleted);
      if (newPomodorosCompleted % LONG_BREAK_INTERVAL === 0) {
        setMode('longBreak');
      } else {
        setMode('shortBreak');
      }
    } else {
      setMode('pomodoro');
    }
  }, [mode, pomodorosCompleted, toast]);
  
  useInterval(() => {
 if (isRunning && timeLeft > 0) {
      setTimeLeft(prevTime => prevTime - 1);
    } else if (isRunning && timeLeft === 0) {
      handleTimerEnd();
    }
  }, isRunning ? 1000 : null);


  const requestNotificationPermission = () => {
    if (typeof window !== "undefined" && typeof Notification !== 'undefined') {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            toast({ title: "Notifications Enabled", description: "You'll receive a notification when a Pomodoro session ends." });
          } else {
            toast({ title: "Notifications Denied", description: "Browser notifications are disabled.", variant: "destructive" });
          }
        });
      } else if (Notification.permission === "denied") {
         toast({ title: "Notifications Blocked", description: "Please enable notifications in your browser settings if you want to receive them.", variant: "destructive" });
      }
    }
  };

  const handleStartPause = () => {
    if (timeLeft === 0 && !isRunning) { // If timer ended and user wants to restart current mode
        setTimeLeft(MODES[mode].duration);
    }
    setIsRunning(!isRunning);
    if (!isRunning && timeLeft > 0) { // If starting
        requestNotificationPermission();
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(MODES[mode].duration);
  };

  const handleSkip = () => {
    handleTimerEnd(); // Same logic as timer ending naturally
  };
  
  const selectMode = (newMode: Mode) => {
    setIsRunning(false); // Stop timer when switching modes
    setMode(newMode);
    setTimeLeft(MODES[newMode].duration);
  };

  const CurrentIcon = MODES[mode].Icon;
  const progressPercentage = ((MODES[mode].duration - timeLeft) / MODES[mode].duration) * 100;

  return (
    <div className="space-y-6 flex flex-col items-center">
      <div className="flex space-x-2 mb-4">
        {(['pomodoro', 'shortBreak', 'longBreak'] as Mode[]).map((m) => (
          <Button
            key={m}
            variant={mode === m ? 'default' : 'outline'}
            onClick={() => selectMode(m)}
            className="capitalize"
            size="sm"
          >
            {MODES[m].label}
          </Button>
        ))}
      </div>

      <div className="flex items-center justify-center text-6xl font-bold text-primary tabular-nums tracking-tight my-4 p-6 rounded-full w-64 h-64 border-4 border-primary relative shadow-lg">
        <div className="absolute inset-0">
            <svg width="100%" height="100%" viewBox="0 0 250 250" className="transform -rotate-90">
                <circle cx="125" cy="125" r="115" stroke="hsl(var(--muted))" strokeWidth="12" fill="transparent"/>
                <circle 
                    cx="125" cy="125" r="115" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth="12" fill="transparent"
                    strokeDasharray={2 * Math.PI * 115}
                    strokeDashoffset={(2 * Math.PI * 115) * (1 - progressPercentage / 100)}
                    className="transition-all duration-1000 ease-linear"
                />
            </svg>
        </div>
        <div className="relative z-10 flex flex-col items-center">
            <CurrentIcon className="h-10 w-10 mb-2 text-primary" />
            {formatTime(timeLeft)}
        </div>
      </div>
      
      <div className="w-full max-w-xs">
        <Progress value={progressPercentage} className="h-2" />
      </div>


      <div className="flex justify-center space-x-3 mt-4">
        <Button onClick={handleStartPause} variant={isRunning ? "outline" : "default"} size="lg" className="w-28">
          {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
          {isRunning ? 'Pause' : 'Start'}
        </Button>
        <Button onClick={handleReset} variant="outline" size="lg" title="Reset Timer">
          <RotateCcw />
        </Button>
         <Button onClick={handleSkip} variant="outline" size="lg" title="Skip to Next">
          <SkipForward />
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground mt-4">
        Pomodoros completed: {pomodorosCompleted}
      </p>
      {/* Conditionally render notification permission button on client-side */}
      {typeof window !== "undefined" && typeof Notification !== 'undefined' && Notification.permission !== "granted" && Notification.permission !== "denied" && (
        <Button variant="link" onClick={requestNotificationPermission} className="text-xs mt-2">
            Enable browser notifications
        </Button>
      )}
    </div>
  );
}
