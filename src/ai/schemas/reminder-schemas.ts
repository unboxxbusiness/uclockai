
/**
 * @fileOverview Zod schemas for the smart reminder suggestion feature.
 */
import { z } from 'zod';

export const SuggestReminderInputSchema = z.object({
  userInput: z.string().min(1, { message: "Reminder idea cannot be empty."}).describe('The user\'s raw text input for a reminder idea.'),
});
export type SuggestReminderInput = z.infer<typeof SuggestReminderInputSchema>;


export const SuggestReminderOutputSchema = z.object({
  suggestedText: z.string().describe('The AI-refined, clear, and actionable reminder text.'),
});
export type SuggestReminderOutput = z.infer<typeof SuggestReminderOutputSchema>;
