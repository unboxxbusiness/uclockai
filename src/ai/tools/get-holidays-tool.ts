
/**
 * @fileOverview A Genkit tool to fetch public holidays from the Nager.Date API.
 *
 * - getHolidaysTool - The Genkit tool definition.
 * - GetHolidaysToolInputSchema - Input schema for the tool.
 * - GetHolidaysToolOutputSchema - Output schema for the tool.
 * - HolidaySchema - Schema for a single holiday object from the API.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const GetHolidaysToolInputSchema = z.object({
  countryCode: z.string().length(2, { message: "Country code must be 2 characters."})
    .regex(/^[A-Z]{2}$/, { message: "Country code must be 2 uppercase letters."})
    .describe('The 2-letter ISO 3166-1 alpha-2 country code (e.g., US, GB).'),
  year: z.string().regex(/^\d{4}$/, { message: "Year must be 4 digits."})
    .describe('The year for which to fetch holidays (e.g., 2024).'),
});
export type GetHolidaysToolInput = z.infer<typeof GetHolidaysToolInputSchema>;

export const HolidaySchema = z.object({
  date: z.string().describe('The date of the holiday (YYYY-MM-DD).'),
  localName: z.string().describe('The local name of the holiday.'),
  name: z.string().describe('The English name of the holiday.'),
  countryCode: z.string().describe('The country code.'),
  fixed: z.boolean().optional().describe('Is the holiday on a fixed date?'),
  global: z.boolean().optional().describe('Is the holiday global?'),
  types: z.array(z.string()).optional().describe('Types of holiday (e.g., Public).'),
});
export type Holiday = z.infer<typeof HolidaySchema>;

export const GetHolidaysToolOutputSchema = z.array(HolidaySchema);
export type GetHolidaysToolOutput = z.infer<typeof GetHolidaysToolOutputSchema>;

export const getHolidaysTool = ai.defineTool(
  {
    name: 'getHolidaysTool',
    description: 'Fetches public holidays for a given country and year from the Nager.Date API (public endpoint).',
    inputSchema: GetHolidaysToolInputSchema,
    outputSchema: GetHolidaysToolOutputSchema,
  },
  async ({ countryCode, year }) => {
    const apiUrl = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode.toUpperCase()}`;
    try {
      const response = await fetch(apiUrl, { cache: 'no-store' }); // Disable caching for fresh data

      if (!response.ok) {
        let errorDetails = `Nager.Date API responded with status: ${response.status} ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorDetails += ` - ${JSON.stringify(errorData)}`;
        } catch (e) {
            // Response might not be JSON
        }
        console.error(errorDetails);
        if (response.status === 404) { // Country not found or no holidays for that year
          return []; // Return empty array, as per API behavior for no data
        }
        if (response.status === 400) { // Bad request (e.g. invalid year format, though schema should catch this)
            throw new Error(`Invalid input for Nager.Date API: Country code '${countryCode}' or year '${year}' might be incorrectly formatted or not supported.`);
        }
        throw new Error(`Failed to fetch holidays from Nager.Date API. Status: ${response.status}`);
      }
      const holidays: GetHolidaysToolOutput = await response.json();
      return holidays;
    } catch (error: any) {
      console.error('Error calling Nager.Date API:', error);
      throw new Error(`Error fetching holidays via Nager.Date API: ${error.message}`);
    }
  }
);
