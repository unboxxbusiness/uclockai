
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { holidayLookup, type HolidayLookupOutput } from '@/ai/flows/holiday-lookup';
import { HolidayLookupInputSchema } from '@/ai/schemas/holiday-schemas';
import { Loader2, CalendarDays, AlertCircle, Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type HolidayFormValues = z.infer<typeof HolidayLookupInputSchema>;

export default function HolidayFinderWidget() {
  const [holidaysResult, setHolidaysResult] = useState<HolidayLookupOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedCriteria, setSearchedCriteria] = useState<{ countryCode: string; year?: string } | null>(null);

  const form = useForm<HolidayFormValues>({
    resolver: zodResolver(HolidayLookupInputSchema),
    defaultValues: {
      countryCode: 'US', // Default to US
      year: '',
    },
  });

  const onSubmit = async (values: HolidayFormValues) => {
    setIsLoading(true);
    setError(null);
    setHolidaysResult(null);
    setSearchedCriteria({ countryCode: values.countryCode.toUpperCase(), year: values.year });

    try {
      const result = await holidayLookup({ 
        countryCode: values.countryCode, 
        year: values.year || undefined 
      });
      setHolidaysResult(result);
    } catch (err: any) {
      console.error("Holiday lookup error:", err);
      setError(err.message || "Failed to fetch holidays. Please check the inputs or try again later.");
      setHolidaysResult(null);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="countryCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="countryCode">Country Code (2-letter)</FormLabel>
                  <FormControl>
                    <Input 
                      id="countryCode" 
                      placeholder="e.g., US, CA, GB" 
                      {...field} 
                      disabled={isLoading}
                      autoCapitalize="characters"
                      maxLength={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="year">Year (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      id="year" 
                      placeholder={`e.g., ${new Date().getFullYear()}`} 
                      {...field} 
                      disabled={isLoading}
                      type="text"
                      maxLength={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarDays className="mr-2 h-4 w-4" />}
            Find Holidays
          </Button>
        </form>
      </Form>

      {error && (
        <div className="text-destructive p-3 bg-destructive/10 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 shrink-0 mt-0.5" /> 
          <p className="text-sm">{error}</p>
        </div>
      )}

      {holidaysResult && !isLoading && !error && (
        <>
          {holidaysResult.holidays && holidaysResult.holidays.length > 0 ? (
            <ScrollArea className="h-60 border rounded-md p-1 bg-muted/20">
              <h3 className="text-sm font-medium my-2 text-muted-foreground px-3">
                Public Holidays in {searchedCriteria?.countryCode?.toUpperCase()}
                {searchedCriteria?.year ? ` for ${searchedCriteria.year}` : ` for ${new Date().getFullYear()}`}:
              </h3>
              <ul className="space-y-1 p-2">
                {holidaysResult.holidays.map((holiday, index) => (
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
               No public holidays found for {searchedCriteria?.countryCode?.toUpperCase()}
               {searchedCriteria?.year ? ` in ${searchedCriteria.year}` : ` for ${new Date().getFullYear()}`}.
             </p>
          )}

          {holidaysResult?.message && (
            <div className="mt-3 text-sm p-3 bg-accent/10 text-accent-foreground/90 rounded-md flex items-start">
              <Info className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
              <p>{holidaysResult.message}</p>
            </div>
          )}

          {holidaysResult?.dataSource && (
            <p className="text-xs text-muted-foreground mt-3 text-center px-1">
              Holiday data provided by {holidaysResult.dataSource}. 
              The public API endpoint may have limitations. It is recommended to verify critical dates from official sources, especially if the API indicates limited data for a specific region or year.
            </p>
          )}
        </>
      )}
    </div>
  );
}
