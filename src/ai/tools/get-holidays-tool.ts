
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

      if (response.status === 204) { // No content, meaning no holidays for this query
        return [];
      }

      if (!response.ok) {
        let errorDetails = `Nager.Date API responded with status: ${response.status} ${response.statusText}`;
        let errorResponseText: string | null = null;
        try {
            errorResponseText = await response.text(); // Try to get raw response text
            if (errorResponseText) {
                // Attempt to parse as JSON if there's content, otherwise append raw text
                try {
                    const errorData = JSON.parse(errorResponseText);
                    errorDetails += ` - Data: ${JSON.stringify(errorData)}`;
                } catch (e) {
                    errorDetails += ` - Body: ${errorResponseText}`;
                }
            }
        } catch (e) {
            // Failed to get text or parse, log that we couldn't get more details
            errorDetails += ` - Could not retrieve error body.`;
        }
        console.error(errorDetails);

        if (response.status === 404) { // Country not found or no holidays for that year in their system for that country code
          return []; // Treat as no holidays found
        }
        if (response.status === 400) { // Bad request (e.g. invalid year format, though schema should catch this)
            throw new Error(`Invalid input for Nager.Date API: Country code '${countryCode}' or year '${year}' might be incorrectly formatted or not supported. API Status: ${response.status}. Details: ${errorDetails}`);
        }
        throw new Error(`Failed to fetch holidays from Nager.Date API. Status: ${response.status}. Details: ${errorDetails}`);
      }
      
      // If response.ok and not 204, attempt to parse JSON
      const responseText = await response.text();
      if (!responseText) { 
        // This case should ideally be covered by 204, but as a safeguard:
        console.warn(`Nager.Date API returned an OK status (${response.status}) but with an empty body for ${countryCode}, ${year}.`);
        return [];
      }

      try {
          const holidays: GetHolidaysToolOutput = JSON.parse(responseText);
          return holidays;
      } catch (parseError: any) {
          console.error('Error parsing JSON from Nager.Date API:', parseError);
          console.error('Nager.Date API response text that failed to parse:', responseText);
          throw new Error(`Failed to parse holiday data from Nager.Date API. The response was not valid JSON. API Status: ${response.status}. Details: ${parseError.message}`);
      }

    } catch (error: any) {
      console.error(`Error in getHolidaysTool calling Nager.Date API for ${countryCode}, ${year}:`, error);
      // If the error is one we've constructed above, re-throw it to avoid nesting messages.
      if (error.message?.includes('Nager.Date API')) {
          throw error;
      }
      throw new Error(`Network or unexpected error when fetching holidays via Nager.Date API: ${error.message}`);
    }
  }
);
