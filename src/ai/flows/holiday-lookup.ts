
'use server';

/**
 * @fileOverview A public holiday lookup agent that uses an external API via a Genkit tool.
 *
 * - holidayLookup - A function that handles the holiday lookup process.
 * - HolidayLookupInput - The input type for the holidayLookup function.
 * - HolidayLookupOutput - The return type for the holidayLookup function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { getHolidaysTool } from '@/ai/tools/get-holidays-tool';

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
export type HolidayLookupInput = z.infer<typeof HolidayLookupInputSchema>;

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
export type HolidayLookupOutput = z.infer<typeof HolidayLookupOutputSchema>;

export async function holidayLookup(input: HolidayLookupInput): Promise<HolidayLookupOutput> {
  return holidayLookupFlow(input);
}

const holidayLookupFlow = ai.defineFlow(
  {
    name: 'holidayLookupFlow',
    inputSchema: HolidayLookupInputSchema,
    outputSchema: HolidayLookupOutputSchema,
  },
  async ({ countryCode, year }) => {
    const currentYear = new Date().getFullYear().toString();
    const targetYear = year || currentYear;
    const upperCaseCountryCode = countryCode.toUpperCase();

    try {
      const apiHolidays = await getHolidaysTool({ countryCode: upperCaseCountryCode, year: targetYear });

      if (!Array.isArray(apiHolidays)) {
        console.error("Nager.Date tool did not return an array:", apiHolidays);
        return {
            holidays: [],
            dataSource: 'Nager.Date API (Public/No-Key)',
            message: 'Received unexpected data from the holiday API.',
        };
      }
      
      const holidays = apiHolidays.map(h => ({
        name: h.localName || h.name, 
        date: h.date, 
      }));

      return {
        holidays,
        dataSource: 'Nager.Date API (Public/No-Key)',
      };
    } catch (error: any) {
      console.error(`Error in holidayLookupFlow while fetching holidays for ${upperCaseCountryCode}, ${targetYear}:`, error);
      // Let the widget handle displaying the error message passed from the tool or flow.
      // This ensures the UI can inform the user about specific issues.
      throw new Error(`Failed to retrieve holidays: ${error.message}`);
    }
  }
);
