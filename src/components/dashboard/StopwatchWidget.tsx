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
      <div className="text-center text-6xl font-bold text-primary tabular-nums tracking-tight">
        {formatStopwatchTime(time)}
      </div>
      <div className="flex justify-center space-x-3">
        <Button onClick={handleStartStop} variant={isRunning ? "outline" : "default"} size="lg">
          {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
          {isRunning ? 'Pause' : 'Start'}
        </Button>
        <Button onClick={handleLap} variant="outline" size="lg" disabled={!isRunning && time === 0}>
          <Flag className="mr-2" />
          Lap
        </Button>
        <Button onClick={handleReset} variant="outline" size="lg">
          <RotateCcw className="mr-2" />
          Reset
        </Button>
      </div>
      {laps.length > 0 && (
        <ScrollArea className="h-40 flex-grow border rounded-md p-2 bg-muted/20">
          <h3 className="text-sm font-medium mb-2 text-muted-foreground px-2">Laps:</h3>
          <ul className="space-y-1">
            {laps.map((lapTime, index) => (
              <li key={index} className="flex justify-between items-center text-sm px-2 py-1 rounded hover:bg-muted">
                <span>Lap {laps.length - index}</span>
                <span className="font-mono text-foreground">{formatStopwatchTime(lapTime - (laps[index-1] || 0) )}</span>
                <span className="font-mono text-muted-foreground">{formatStopwatchTime(lapTime)}</span>
              </li>
            )).reverse()}
          </ul>
        </ScrollArea>
      )}
    </div>
  );
}
