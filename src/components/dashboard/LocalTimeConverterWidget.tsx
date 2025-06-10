
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getTimezones, type TimezoneOption } from '@/lib/timezones';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LocalTimeConverterWidget() {
  const [localDateTimeInput, setLocalDateTimeInput] = useState<string>('');
  const [targetTimezone, setTargetTimezone] = useState<string>('');
  const [convertedDateTime, setConvertedDateTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const timezones = useMemo(() => getTimezones(), []);

  useEffect(() => {
    // Set initial datetime-local value to current local time
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
    setLocalDateTimeInput(localISOTime);

    // Set initial target timezone
    const userLocalTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const defaultTargetTz = timezones.find(tz => tz.value === 'UTC') ? 'UTC' : (timezones[0]?.value || '');
    setTargetTimezone(defaultTargetTz || userLocalTz); // Fallback to user's local if UTC not found

  }, [timezones]);


  useEffect(() => {
    if (localDateTimeInput && targetTimezone) {
      try {
        setError(null);
        const dateObj = new Date(localDateTimeInput); // Parses "YYYY-MM-DDTHH:mm" as local time

        if (isNaN(dateObj.getTime())) {
          setError("Invalid date/time input.");
          setConvertedDateTime(null);
          return;
        }

        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: targetTimezone,
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
          timeZoneName: 'short',
        });
        
        setConvertedDateTime(formatter.format(dateObj));
      } catch (e: any) {
        console.error("Error converting time:", e);
        setError("Could not convert time. Ensure timezone is valid.");
        setConvertedDateTime(null);
      }
    } else {
      setConvertedDateTime(null);
    }
  }, [localDateTimeInput, targetTimezone]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="local-datetime">Your Local Date & Time</Label>
        <Input
          id="local-datetime"
          type="datetime-local"
          value={localDateTimeInput}
          onChange={(e) => setLocalDateTimeInput(e.target.value)}
          className="text-base"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="target-timezone">Target Timezone</Label>
        <Select value={targetTimezone} onValueChange={setTargetTimezone}>
          <SelectTrigger id="target-timezone">
            <SelectValue placeholder="Select target timezone" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {timezones.map((tz: TimezoneOption) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
         <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {convertedDateTime && !error && (
        <Card className="bg-muted/30 shadow-inner">
          <CardHeader className="pb-2 pt-4">
            <CardDescription className="text-sm">Converted Time in {targetTimezone.replace(/_/g, ' ')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-semibold text-primary">{convertedDateTime}</p>
          </CardContent>
        </Card>
      )}
       <Alert variant="default" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            This tool converts the selected local date and time from your current browser's timezone to the target timezone.
            For advanced conversions between any two arbitrary timezones, a dedicated timezone library or service might be more suitable.
          </AlertDescription>
        </Alert>
    </div>
  );
}
