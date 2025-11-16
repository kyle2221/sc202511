'use server';
/**
 * @fileOverview Generates a React component from a natural language description of a desired app.
 *
 * - generateCodeFromApp - A function that generates code from an app description.
 * - GenerateCodeFromAppInput - The input type for the generateCodeFromApp function.
 * - GenerateCodeFromAppOutput - The return type for the generateCodeFromApp function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { ModelId } from 'genkit';
import { openAI } from 'genkitx-openai';


const GenerateCodeFromAppInputSchema = z.object({
  appDescription: z
    .string()
    .describe(
      'A natural language description of the desired component (e.g., \'a retro cyberpunk login form\').'
    ),
  model: z.custom<ModelId>(),
  language: z.string().describe('The programming language for the generated code.'),
});
export type GenerateCodeFromAppInput = z.infer<typeof GenerateCodeFromAppInputSchema>;

const GenerateCodeFromAppOutputSchema = z.object({
  generatedCode: z.string().describe('A complete, functional, self-contained code snippet in the specified language. For React, it must be a single TSX file with all imports. For other languages, it should be a complete and runnable snippet.'),
  thoughts: z.string().describe("The AI's thought process for why it made the design choices it did."),
});
export type GenerateCodeFromAppOutput = z.infer<typeof GenerateCodeFromAppOutputSchema>;

export async function generateCodeFromApp(
  input: GenerateCodeFromAppInput
): Promise<GenerateCodeFromAppOutput> {
  return generateCodeFromAppFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodeFromAppPrompt',
  input: {schema: GenerateCodeFromAppInputSchema},
  output: {schema: GenerateCodeFromAppOutputSchema},
  prompt: `You are an expert software engineer and designer. You will be given a description and a target programming language. Your task is to generate a single, complete, self-contained code snippet in that language.

Follow these instructions carefully:

1.  **Analyze the Description:** First, think about the provided description. Break it down into design and functionality principles. Document these thoughts in the 'thoughts' output field.

2.  **Generate Code:** Create a single, complete code snippet based on the requested language.

    *   **For "TypeScript (React)":**
        *   The component must be named \`AppComponent\`.
        *   It must be a functional React component in a TSX string.
        *   It MUST import necessary components from libraries like \`lucide-react\` and shadcn/ui (e.g., \`@/components/ui/button\`). Assume all shadcn/ui components are available.
        *   Style the component using **standard Tailwind CSS classes**.
        *   The root element of the component MUST have the className \`"p-8 h-full w-full flex flex-col items-center justify-center"\`. This is critical for layout.
        *   Ensure the component is fully self-contained in the TSX string, including all necessary imports. Do NOT include the \`'use client'\` directive.

    *   **For "Python":**
        *   Generate a single, complete Python script.
        *   The code should be well-commented and follow PEP 8 standards.
        *   If the request implies data manipulation or analysis, use libraries like pandas or numpy.
        *   If it's a web-related task, you might use Flask or FastAPI.
        *   The code should be a runnable example that clearly demonstrates the described functionality.

    *   **For "HTML":**
        *   Generate a single, complete HTML file.
        *   Include inline CSS within a \`<style>\` tag for styling. Do not use Tailwind CSS classes, as they won't be available.
        *   If JavaScript is needed for interactivity, include it within a \`<script>\` tag.
        *   The output should be a valid HTML5 document starting with \`<!DOCTYPE html>\`.

    *   **For all other languages:**
        *   Generate a single, complete, and runnable code snippet that is a good representation of the requested functionality in that language.
        *   The code should be well-structured and idiomatic for the chosen language.

Language: {{{language}}}
App Description: {{{appDescription}}}`,
});

const generateCodeFromAppFlow = ai.defineFlow(
  {
    name: 'generateCodeFromAppFlow',
    inputSchema: GenerateCodeFromAppInputSchema,
    outputSchema: GenerateCodeFromAppOutputSchema,
  },
  async input => {
    const {output} = await ai.generate(
      {
        prompt: prompt.prompt!,
        model: openAI(input.model as string),
        input: { appDescription: input.appDescription, model: input.model, language: input.language },
        output: { schema: prompt.output?.schema! },
      }
    );
    return output;
  }
);
