
'use server';
/**
 * @fileOverview An AI flow to suggest refined reminder text.
 *
 * - suggestReminder - A function that handles the reminder suggestion process.
 * - SuggestReminderInput - The input type.
 * - SuggestReminderOutput - The output type.
 */

import { ai } from '@/ai/genkit';
import { SuggestReminderInputSchema, SuggestReminderOutputSchema } from '@/ai/schemas/reminder-schemas';
import type { z } from 'zod';

export type SuggestReminderInput = z.infer<typeof SuggestReminderInputSchema>;
export type SuggestReminderOutput = z.infer<typeof SuggestReminderOutputSchema>;

export async function suggestReminder(input: SuggestReminderInput): Promise<SuggestReminderOutput> {
  return suggestReminderFlow(input);
}

const suggestReminderPrompt = ai.definePrompt({
  name: 'suggestReminderPrompt',
  input: { schema: SuggestReminderInputSchema },
  output: { schema: SuggestReminderOutputSchema },
  prompt: `You are an assistant helping users create effective reminders.
Given the user's input: '{{userInput}}'

Your task is to refine this input into a clear and actionable reminder text.
Focus on making the reminder specific and easy to understand.

Examples:
- User input: 'call mom' -> Suggested text: 'Call Mom'
- User input: 'buy milk grocery store' -> Suggested text: 'Buy milk at the grocery store'
- User input: 'meeting with sales team tuesday' -> Suggested text: 'Meeting with the sales team on Tuesday'
- User input: 'dr appointment next week' -> Suggested text: 'Doctor appointment next week'
- User input: 'finish report' -> Suggested text: 'Finish the report'

Return only the suggested text.`,
});

const suggestReminderFlow = ai.defineFlow(
  {
    name: 'suggestReminderFlow',
    inputSchema: SuggestReminderInputSchema,
    outputSchema: SuggestReminderOutputSchema,
  },
  async (input) => {
    const { output } = await suggestReminderPrompt(input);
    if (!output) {
      // Fallback if AI returns nothing, though schema validation should ensure output structure
      return { suggestedText: input.userInput };
    }
    return output;
  }
);
