'use server';

/**
 * @fileOverview An AI agent that suggests relevant keywords based on the analysis of historical WhatsApp conversations.
 *
 * - suggestRelevantKeywords - A function that suggests relevant keywords based on historical WhatsApp conversations.
 * - SuggestRelevantKeywordsInput - The input type for the suggestRelevantKeywords function.
 * - SuggestRelevantKeywordsOutput - The return type for the suggestRelevantKeywords function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelevantKeywordsInputSchema = z.object({
  conversationHistory: z
    .string()
    .describe('The historical WhatsApp conversation data to analyze.'),
});
export type SuggestRelevantKeywordsInput = z.infer<typeof SuggestRelevantKeywordsInputSchema>;

const SuggestRelevantKeywordsOutputSchema = z.object({
  suggestedKeywords: z
    .array(z.string())
    .describe('The suggested keywords based on the conversation history.'),
});
export type SuggestRelevantKeywordsOutput = z.infer<typeof SuggestRelevantKeywordsOutputSchema>;

export async function suggestRelevantKeywords(
  input: SuggestRelevantKeywordsInput
): Promise<SuggestRelevantKeywordsOutput> {
  return suggestRelevantKeywordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelevantKeywordsPrompt',
  input: {schema: SuggestRelevantKeywordsInputSchema},
  output: {schema: SuggestRelevantKeywordsOutputSchema},
  prompt: `You are an AI assistant designed to suggest relevant keywords for a WhatsApp assistant that monitors group conversations and creates tickets when certain keywords are detected.

  Analyze the following conversation history and suggest a list of keywords that would be useful for triggering ticket creation.  The keywords should be relevant to identifying important requests or issues discussed in the conversations.

  Conversation History: {{{conversationHistory}}}

  Format your response as a JSON array of strings.

  Example:
  ["keyword1", "keyword2", "keyword3"]
  `,
});

const suggestRelevantKeywordsFlow = ai.defineFlow(
  {
    name: 'suggestRelevantKeywordsFlow',
    inputSchema: SuggestRelevantKeywordsInputSchema,
    outputSchema: SuggestRelevantKeywordsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
