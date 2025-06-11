
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
        console.error("Holiday tool did not return an array:", apiHolidays);
        return {
            holidays: [],
            dataSource: 'Public Holiday Data Service',
            message: advisoryMessage || 'Received unexpected data from the holiday data service.',
        };
      }
      
      const holidays = apiHolidays.map(h => ({
        name: h.localName || h.name, 
        date: h.date, 
      }));

      let finalMessage = advisoryMessage;
      const newDataSource = 'Public Holiday Data Service';

      if (holidays.length === 0) {
        if (upperCaseCountryCode === 'IN') {
          finalMessage = `No public holiday data is currently listed for India (IN) for the year ${targetYear}. ${advisoryMessage}`;
        } else if (!finalMessage) { 
          finalMessage = `No public holidays were found for ${upperCaseCountryCode} for ${targetYear}. This could be due to no holidays for this selection, an incorrect country code, or the data service having no data for this query.`;
        }
      }


      return {
        holidays,
        dataSource: newDataSource,
        message: finalMessage || undefined, 
      };
    } catch (error: any) {
      // Log the original error for server-side debugging
      console.error(`Error in holidayLookupFlow fetching holidays for ${upperCaseCountryCode}, ${targetYear}. Original error: ${error.message}`, error.stack);
      
      // Provide a generic error message to the client
      const genericErrorMessage = "An error occurred while fetching holiday data. Please check your input or try again later.";
      const finalUserErrorMessage = advisoryMessage ? `${advisoryMessage} Additionally, ${genericErrorMessage.toLowerCase()}` : genericErrorMessage;
      
      throw new Error(finalUserErrorMessage);
    }
  }
);
