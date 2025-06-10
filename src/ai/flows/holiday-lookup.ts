
'use server';

/**
 * @fileOverview A public holiday lookup AI agent.
 *
 * - holidayLookup - A function that handles the holiday lookup process.
 * - HolidayLookupInput - The input type for the holidayLookup function.
 * - HolidayLookupOutput - The return type for the holidayLookup function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HolidayLookupInputSchema = z.object({
  location: z.string().describe('The location for which to lookup public holidays.'),
  year: z.string().optional().describe('The specific year for which to find holidays (e.g., 2024). If not provided, upcoming holidays for the next 12 months should be returned.'),
});
export type HolidayLookupInput = z.infer<typeof HolidayLookupInputSchema>;

const HolidayLookupOutputSchema = z.object({
  holidays: z.array(
    z.object({
      name: z.string().describe('The name of the holiday.'),
      date: z.string().describe('The date of the holiday (ISO 8601 format, e.g., YYYY-MM-DD).'),
    })
  ).describe('A list of public holidays for the given location and year (if specified).'),
});
export type HolidayLookupOutput = z.infer<typeof HolidayLookupOutputSchema>;

export async function holidayLookup(input: HolidayLookupInput): Promise<HolidayLookupOutput> {
  return holidayLookupFlow(input);
}

const prompt = ai.definePrompt({
  name: 'holidayLookupPrompt',
  input: {schema: HolidayLookupInputSchema},
  output: {schema: HolidayLookupOutputSchema},
  prompt: `You are a helpful assistant that provides a list of official public holidays.

Location: {{{location}}}
{{#if year}}
Year: {{{year}}}
Please provide holidays for the specified year.
{{else}}
Please provide holidays for the upcoming 12 months from the current date.
{{/if}}

Ensure the dates are accurate and reflect official public holidays.
Return the list of holidays in JSON format, with dates in ISO 8601 format (YYYY-MM-DD).
For example: { "holidays": [ { "name": "New Year's Day", "date": "2024-01-01" } ] }
`,
});

const holidayLookupFlow = ai.defineFlow(
  {
    name: 'holidayLookupFlow',
    inputSchema: HolidayLookupInputSchema,
    outputSchema: HolidayLookupOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
