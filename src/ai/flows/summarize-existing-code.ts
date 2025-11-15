'use server';

/**
 * @fileOverview Summarizes the aesthetic of existing code.
 *
 * - summarizeExistingCode - A function that takes code as input and returns a summary of its aesthetic.
 * - SummarizeExistingCodeInput - The input type for the summarizeExistingCode function.
 * - SummarizeExistingCodeOutput - The return type for the summarizeExistingCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeExistingCodeInputSchema = z.object({
  code: z.string().describe('The code to summarize the aesthetic of.'),
});
export type SummarizeExistingCodeInput = z.infer<
  typeof SummarizeExistingCodeInputSchema
>;

const SummarizeExistingCodeOutputSchema = z.object({
  summary: z.string().describe('A summary of the aesthetic of the code.'),
});
export type SummarizeExistingCodeOutput = z.infer<
  typeof SummarizeExistingCodeOutputSchema
>;

export async function summarizeExistingCode(
  input: SummarizeExistingCodeInput
): Promise<SummarizeExistingCodeOutput> {
  return summarizeExistingCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeExistingCodePrompt',
  input: {schema: SummarizeExistingCodeInputSchema},
  output: {schema: SummarizeExistingCodeOutputSchema},
  prompt: `You are an expert in web aesthetics. Please review the following code and summarize its aesthetic in a few sentences.

Code:
\`\`\`{{{code}}}\`\`\`',
});

const summarizeExistingCodeFlow = ai.defineFlow(
  {
    name: 'summarizeExistingCodeFlow',
    inputSchema: SummarizeExistingCodeInputSchema,
    outputSchema: SummarizeExistingCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
