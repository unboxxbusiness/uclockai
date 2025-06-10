"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useInterval } from '@/hooks/useInterval';
import { useToast } from "@/hooks/use-toast";

const formatTime = (timeInSeconds: number): string => {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function TimerWidget() {
  const [initialTime, setInitialTime] = useState({ hours: 0, minutes: 5, seconds: 0 });
  const [timeLeft, setTimeLeft] = useState(initialTime.minutes * 60 + initialTime.seconds);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const totalInitialSeconds = useCallback(() => {
    return (initialTime.hours * 3600) + (initialTime.minutes * 60) + initialTime.seconds;
  }, [initialTime]);

  useEffect(() => {
    setTimeLeft(totalInitialSeconds());
  }, [initialTime, totalInitialSeconds]);

  useInterval(() => {
    if (isRunning && timeLeft > 0) {
      setTimeLeft(prevTime => prevTime - 1);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      toast({
        title: "Timer Finished!",
        description: "Your timer has ended.",
      });
      // Optionally play a sound here
    }
  }, isRunning ? 1000 : null);

  const handleInputChange = (field: 'hours' | 'minutes' | 'seconds', value: string) => {
    if (isRunning) return; // Don't allow changes while running
    const numValue = parseInt(value, 10);
    setInitialTime(prev => ({ ...prev, [field]: isNaN(numValue) ? 0 : Math.max(0, numValue) }));
  };

  const handleStartPause = () => {
    if (timeLeft === 0 && totalInitialSeconds() === 0) return; // Don't start if time is 0
    if (timeLeft === 0 && totalInitialSeconds() > 0 && !isRunning) { // If timer ended and user wants to restart
        setTimeLeft(totalInitialSeconds());
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(totalInitialSeconds());
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-2 items-end">
        <div>
          <Label htmlFor="hours">Hours</Label>
          <Input id="hours" type="number" value={initialTime.hours} onChange={e => handleInputChange('hours', e.target.value)} disabled={isRunning} min="0" />
        </div>
        <div>
          <Label htmlFor="minutes">Minutes</Label>
          <Input id="minutes" type="number" value={initialTime.minutes} onChange={e => handleInputChange('minutes', e.target.value)} disabled={isRunning} min="0" max="59" />
        </div>
        <div>
          <Label htmlFor="seconds">Seconds</Label>
          <Input id="seconds" type="number" value={initialTime.seconds} onChange={e => handleInputChange('seconds', e.target.value)} disabled={isRunning} min="0" max="59" />
        </div>
      </div>
      <div className="text-center text-6xl font-bold text-primary tabular-nums tracking-tight">
        {formatTime(timeLeft)}
      </div>
      <div className="flex justify-center space-x-3">
        <Button onClick={handleStartPause} variant={isRunning ? "outline" : "default"} size="lg" disabled={totalInitialSeconds() === 0 && timeLeft === 0}>
          {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
          {isRunning ? 'Pause' : 'Start'}
        </Button>
        <Button onClick={handleReset} variant="outline" size="lg">
          <RotateCcw className="mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
}
