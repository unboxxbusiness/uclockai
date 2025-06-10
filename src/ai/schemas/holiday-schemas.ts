
/**
 * @fileOverview Zod schemas for the holiday lookup feature.
 * These schemas are used by both the Genkit flow and client-side components.
 */
import { z } from 'zod';

export const HolidayLookupInputSchema = z.object({
  countryCode: z.string()
    .trim()
    .length(2, { message: "Country code must be 2 characters."})
    .regex(/^[a-zA-Z]{2}$/, { message: "Country code must be 2 letters."})
    .describe('The 2-letter ISO 3166-1 alpha-2 country code (e.g., US, GB). Case-insensitive, will be uppercased.'),
  year: z.string()
    .trim()
    .regex(/^\d{4}$/, { message: "Year must be 4 digits."})
    .optional()
    .describe('The specific year for which to find holidays (e.g., 2024). If not provided, the current year will be used.'),
});

const HolidayOutputItemSchema = z.object({
  name: z.string().describe('The name of the holiday.'),
  date: z.string().describe('The date of the holiday (ISO 8601 format, e.g., YYYY-MM-DD).'),
});

export const HolidayLookupOutputSchema = z.object({
  holidays: z.array(HolidayOutputItemSchema)
    .describe('A list of public holidays for the given country and year.'),
  dataSource: z.string().optional().describe('Indicates the source of the holiday data.'),
  message: z.string().optional().describe('An optional message, e.g., for errors or notes.')
});
