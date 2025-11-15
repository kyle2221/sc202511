'use server';

/**
 * @fileOverview Refines previously generated code based on a more detailed prompt.
 *
 * - refineGeneratedCode - A function that refines the generated code.
 * - RefineGeneratedCodeInput - The input type for the refineGeneratedCode function.
 * - RefineGeneratedCodeOutput - The return type for the refineGeneratedCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineGeneratedCodeInputSchema = z.object({
  originalPrompt: z.string().describe('The original prompt used to generate the code.'),
  generatedCode: z.string().describe('The previously generated code to refine.'),
  detailedPrompt: z.string().describe('A more detailed prompt to further refine the generated code.'),
});
export type RefineGeneratedCodeInput = z.infer<typeof RefineGeneratedCodeInputSchema>;

const RefineGeneratedCodeOutputSchema = z.object({
  refinedCode: z.string().describe('The refined code based on the detailed prompt.'),
});
export type RefineGeneratedCodeOutput = z.infer<typeof RefineGeneratedCodeOutputSchema>;

export async function refineGeneratedCode(input: RefineGeneratedCodeInput): Promise<RefineGeneratedCodeOutput> {
  return refineGeneratedCodeFlow(input);
}

const refineGeneratedCodePrompt = ai.definePrompt({
  name: 'refineGeneratedCodePrompt',
  input: {schema: RefineGeneratedCodeInputSchema},
  output: {schema: RefineGeneratedCodeOutputSchema},
  prompt: `You are a code refinement expert. You will be given an original prompt, the code that was generated from it, and a more detailed prompt.
Your goal is to refine the existing code based on the detailed prompt, while ensuring that the code remains consistent with the original prompt's intent.

Original Prompt: {{{originalPrompt}}}

Generated Code: {{{generatedCode}}}

Detailed Prompt: {{{detailedPrompt}}}

Refined Code:`,
});

const refineGeneratedCodeFlow = ai.defineFlow(
  {
    name: 'refineGeneratedCodeFlow',
    inputSchema: RefineGeneratedCodeInputSchema,
    outputSchema: RefineGeneratedCodeOutputSchema,
  },
  async input => {
    const {output} = await refineGeneratedCodePrompt(input);
    return {refinedCode: output!.refinedCode!};
  }
);
