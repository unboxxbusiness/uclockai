
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { holidayLookup, type HolidayLookupOutput } from '@/ai/flows/holiday-lookup';
import { HolidayLookupInputSchema } from '@/ai/schemas/holiday-schemas';
import { Loader2, CalendarDays, AlertCircle, Info, ListChecks } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';

type HolidayFormValues = z.infer<typeof HolidayLookupInputSchema>;

interface AvailableCountry {
  countryCode: string;
  name: string;
}

export default function HolidayFinderWidget() {
  const [holidaysResult, setHolidaysResult] = useState<HolidayLookupOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedCriteria, setSearchedCriteria] = useState<{ countryCode: string; year?: string } | null>(null);

  const [availableCountries, setAvailableCountries] = useState<AvailableCountry[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [countriesError, setCountriesError] = useState<string | null>(null);

  const form = useForm<HolidayFormValues>({
    resolver: zodResolver(HolidayLookupInputSchema),
    defaultValues: {
      countryCode: 'US', // Default to US
      year: '',
    },
  });

  useEffect(() => {
    const fetchAvailableCountries = async () => {
      setIsLoadingCountries(true);
      setCountriesError(null);
      try {
        const response = await fetch('https://date.nager.at/api/v3/AvailableCountries');
        if (!response.ok) {
          throw new Error(`Failed to fetch available countries: ${response.status}`);
        }
        const data: AvailableCountry[] = await response.json();
        setAvailableCountries(data.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err: any) {
        console.error("Error fetching available countries:", err);
        setCountriesError(err.message || "Could not load list of supported countries.");
        setAvailableCountries([]);
      } finally {
        setIsLoadingCountries(false);
      }
    };
    fetchAvailableCountries();
  }, []);

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
      console.error("Holiday lookup error (client-side):", err);
      setError(err.message || "Failed to fetch holidays. Please check the inputs or try again later.");
      setHolidaysResult(null);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
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

      {holidaysResult && !isLoading && !error && searchedCriteria && (
        <>
          {holidaysResult.holidays && holidaysResult.holidays.length > 0 ? (
            <ScrollArea className="h-60 border rounded-md p-1 bg-muted/20">
              <h3 className="text-sm font-medium my-2 text-muted-foreground px-3">
                Public Holidays in {searchedCriteria.countryCode}
                {searchedCriteria.year ? ` for ${searchedCriteria.year}` : ` for ${new Date().getFullYear()}`}:
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
               No public holidays found for {searchedCriteria.countryCode}
               {searchedCriteria.year ? ` in ${searchedCriteria.year}` : ` for ${new Date().getFullYear()}`}.
             </p>
          )}

          {holidaysResult?.message && (
            <div className="mt-3 text-sm p-3 bg-accent/10 text-accent-foreground/90 rounded-md flex items-start">
              <Info className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
              <p>{holidaysResult.message}</p>
            </div>
          )}
        </>
      )}
      
      <Separator className="my-6" />

      <div className="space-y-3">
        <h3 className="text-base font-semibold text-foreground flex items-center">
          <ListChecks className="mr-2 h-5 w-5 text-primary" />
          Supported Country Codes
        </h3>
        {isLoadingCountries && (
          <div className="flex items-center text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading supported countries...
          </div>
        )}
        {countriesError && (
          <div className="text-destructive p-3 bg-destructive/10 rounded-md flex items-start text-sm">
            <AlertCircle className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
            <p>{countriesError}</p>
          </div>
        )}
        {!isLoadingCountries && !countriesError && availableCountries.length > 0 && (
          <ScrollArea className="h-48 border rounded-md p-1 bg-muted/20">
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 p-2">
              {availableCountries.map(country => (
                <li key={country.countryCode} className="text-sm p-1 hover:bg-muted rounded">
                  <span className="font-medium text-foreground">{country.name}</span>
                  <span className="text-muted-foreground"> ({country.countryCode})</span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
         {!isLoadingCountries && !countriesError && availableCountries.length === 0 && (
            <p className="text-sm text-muted-foreground">Could not load the list of supported countries.</p>
        )}
      </div>
    </div>
  );
}
