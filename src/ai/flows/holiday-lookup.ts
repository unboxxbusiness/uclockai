
'use server';

/**
 * @fileOverview A public holiday lookup agent that uses an external API via a Genkit tool.
 *
 * - holidayLookup - A function that handles the holiday lookup process.
 * - HolidayLookupInput - The input type for the holidayLookup function (schema defined in holiday-schemas.ts).
 * - HolidayLookupOutput - The return type for the holidayLookup function (schema defined in holiday-schemas.ts).
 */

import {ai} from '@/ai/genkit';
import { getHolidaysTool } from '@/ai/tools/get-holidays-tool';
import { HolidayLookupInputSchema, HolidayLookupOutputSchema } from '@/ai/schemas/holiday-schemas';
import type { z } from 'zod';

export type HolidayLookupInput = z.infer<typeof HolidayLookupInputSchema>;
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
    let advisoryMessage = '';

    if (upperCaseCountryCode === 'IN') {
      advisoryMessage = 'Holiday data for India (IN) should be verified with official sources for accuracy, as variations can occur.';
    }

    try {
      const apiHolidays = await getHolidaysTool({ countryCode: upperCaseCountryCode, year: targetYear });

      if (!Array.isArray(apiHolidays)) {
        console.error("Nager.Date tool did not return an array:", apiHolidays);
        return {
            holidays: [],
            dataSource: 'Nager.Date API (Public/No-Key)',
            message: advisoryMessage || 'Received unexpected data from the holiday API.',
        };
      }
      
      const holidays = apiHolidays.map(h => ({
        name: h.localName || h.name, 
        date: h.date, 
      }));

      let finalMessage = advisoryMessage;

      if (holidays.length === 0) {
        if (upperCaseCountryCode === 'IN') {
          finalMessage = `The Nager.Date API currently has no public holiday data listed for India (IN) for the year ${targetYear}. ${advisoryMessage}`;
        } else if (!finalMessage) { // No holidays for other countries and no pre-existing advisory message
          finalMessage = `No public holidays were found for ${upperCaseCountryCode} for ${targetYear}. This could be due to no holidays for this selection, an incorrect country code, or the API having no data for this query.`;
        }
        // If there was already an advisoryMessage (e.g. for IN but holidays were found, which is not this case), it remains.
      }


      return {
        holidays,
        dataSource: 'Nager.Date API (Public/No-Key)',
        message: finalMessage || undefined, 
      };
    } catch (error: any) {
      console.error(`Error in holidayLookupFlow while fetching holidays for ${upperCaseCountryCode}, ${targetYear}:`, error);
      const errorMessagePrefix = advisoryMessage ? `${advisoryMessage} Additionally, an error occurred: ` : '';
      throw new Error(`${errorMessagePrefix}Failed to retrieve holidays: ${error.message}`);
    }
  }
);

