
"use client";

import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';
import { useInterval } from '@/hooks/useInterval';
import { ScrollArea } from '@/components/ui/scroll-area';

const formatStopwatchTime = (timeInMilliseconds: number): string => {
  const totalSeconds = Math.floor(timeInMilliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((timeInMilliseconds % 1000) / 10); // Display two digits for ms

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
};

export default function StopwatchWidget() {
  const [time, setTime] = useState(0); // Time in milliseconds
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startTimeRef = useRef<number>(0);

  useInterval(() => {
    if (isRunning) {
      setTime(Date.now() - startTimeRef.current);
    }
  }, isRunning ? 10 : null); // Update every 10ms for smoother display

  const handleStartStop = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      startTimeRef.current = Date.now() - time; // Adjust start time if resuming
      setIsRunning(true);
    }
  };

  const handleLap = () => {
    if (isRunning) {
      setLaps(prevLaps => [...prevLaps, time]);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="text-center text-5xl md:text-6xl font-bold text-primary tabular-nums tracking-tight py-4">
        {formatStopwatchTime(time)}
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-2">
        <Button onClick={handleStartStop} variant={isRunning ? "outline" : "default"} size="lg" className="w-full sm:w-auto">
          {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
          {isRunning ? 'Pause' : 'Start'}
        </Button>
        <Button onClick={handleLap} variant="outline" size="lg" disabled={!isRunning && time === 0} className="w-full sm:w-auto">
          <Flag className="mr-2" />
          Lap
        </Button>
        <Button onClick={handleReset} variant="outline" size="lg" className="w-full sm:w-auto">
          <RotateCcw className="mr-2" />
          Reset
        </Button>
      </div>
      {laps.length > 0 && (
        <ScrollArea className="h-48 flex-grow border rounded-md mt-4">
          <h3 className="text-sm font-medium my-2 text-muted-foreground px-4">Laps:</h3>
          <ul className="space-y-2 p-2">
            {laps.map((lapTime, index) => (
              <li 
                key={index} 
                className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-card border"
              >
                <span className="font-semibold text-foreground text-base">Lap {laps.length - index}</span>
                <div className="flex flex-col items-start sm:items-end sm:text-right w-full sm:w-auto mt-1 sm:mt-0">
                  <span className="font-mono text-primary text-lg sm:text-xl">{formatStopwatchTime(lapTime - (laps[index-1] || 0) )}</span>
                  <span className="font-mono text-muted-foreground text-sm">{formatStopwatchTime(lapTime)}</span>
                </div>
              </li>
            )).reverse()}
          </ul>
        </ScrollArea>
      )}
       {laps.length === 0 && (
        <div className="flex-grow flex items-center justify-center text-muted-foreground">
          <p>No laps recorded yet.</p>
        </div>
      )}
    </div>
  );
}
