'use server';
/**
 * @fileOverview Generates CSS snippets and design tokens from a natural language description of a desired vibe.
 *
 * - generateCodeFromVibe - A function that generates code snippets from a vibe description.
 * - GenerateCodeFromVibeInput - The input type for the generateCodeFromVibe function.
 * - GenerateCodeFromVibeOutput - The return type for the generateCodeFromVibe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeFromVibeInputSchema = z.object({
  vibeDescription: z
    .string()
    .describe(
      'A natural language description of the desired aesthetic vibe (e.g., \'retro cyberpunk\', \'minimalist workspace\').'
    ),
});
export type GenerateCodeFromVibeInput = z.infer<typeof GenerateCodeFromVibeInputSchema>;

const GenerateCodeFromVibeOutputSchema = z.object({
  cssSnippet: z.string().describe('A CSS snippet reflecting the described vibe.'),
  designTokens: z.string().describe('Design tokens (e.g., colors, fonts) reflecting the described vibe.'),
});
export type GenerateCodeFromVibeOutput = z.infer<typeof GenerateCodeFromVibeOutputSchema>;

export async function generateCodeFromVibe(
  input: GenerateCodeFromVibeInput
): Promise<GenerateCodeFromVibeOutput> {
  return generateCodeFromVibeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodeFromVibePrompt',
  input: {schema: GenerateCodeFromVibeInputSchema},
  output: {schema: GenerateCodeFromVibeOutputSchema},
  prompt: `You are an expert CSS and design token generator.  Given a vibe description, you will generate a CSS snippet and corresponding design tokens that reflect the vibe. Return the CSS snippet and the design tokens.

Vibe Description: {{{vibeDescription}}} `,
});

const generateCodeFromVibeFlow = ai.defineFlow(
  {
    name: 'generateCodeFromVibeFlow',
    inputSchema: GenerateCodeFromVibeInputSchema,
    outputSchema: GenerateCodeFromVibeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
