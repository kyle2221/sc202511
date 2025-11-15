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
  cssSnippet: z.string().describe('A CSS snippet reflecting the described vibe. This should style the classes .preview-button and .preview-card.'),
  designTokens: z.string().describe('A CSS snippet containing :root CSS variables for design tokens (e.g., colors, fonts) reflecting the described vibe. This should include --background, --foreground, --primary, --primary-foreground, --secondary, --secondary-foreground, --accent, --accent-foreground, --card, --card-foreground, --muted, --muted-foreground, --border, --input, --ring, and --radius.'),
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
  prompt: `You are an expert CSS and design token generator. Given a vibe description, you will generate a CSS snippet and corresponding design tokens that reflect the vibe.

The design tokens should be provided as CSS variables inside a :root block. You must include definitions for all of the following variables:
--background, --foreground, --primary, --primary-foreground, --secondary, --secondary-foreground, --accent, --accent-foreground, --card, --card-foreground, --muted, --muted-foreground, --border, --input, --ring, and --radius.
The colors should be in HSL format (e.g., '205 90% 61%').

The CSS snippet should style the classes .preview-button and .preview-card, using the CSS variables from the design tokens.

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
