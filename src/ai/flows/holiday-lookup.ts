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
});
export type HolidayLookupInput = z.infer<typeof HolidayLookupInputSchema>;

const HolidayLookupOutputSchema = z.object({
  holidays: z.array(
    z.object({
      name: z.string().describe('The name of the holiday.'),
      date: z.string().describe('The date of the holiday (ISO 8601 format).'),
    })
  ).describe('A list of upcoming public holidays for the given location.'),
});
export type HolidayLookupOutput = z.infer<typeof HolidayLookupOutputSchema>;

export async function holidayLookup(input: HolidayLookupInput): Promise<HolidayLookupOutput> {
  return holidayLookupFlow(input);
}

const prompt = ai.definePrompt({
  name: 'holidayLookupPrompt',
  input: {schema: HolidayLookupInputSchema},
  output: {schema: HolidayLookupOutputSchema},
  prompt: `You are a helpful assistant that provides a list of upcoming public holidays for a given location.

  Location: {{{location}}}

  Return the list of holidays in JSON format.
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
