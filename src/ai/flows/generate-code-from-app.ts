'use server';
/**
 * @fileOverview Generates a React component and design tokens from a natural language description of a desired app.
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
      'A natural language description of the desired aesthetic (e.g., \'retro cyberpunk\', \'minimalist workspace\').'
    ),
  model: z.custom<ModelId>(),
});
export type GenerateCodeFromAppInput = z.infer<typeof GenerateCodeFromAppInputSchema>;

const GenerateCodeFromAppOutputSchema = z.object({
  tsxCode: z.string().describe('A complete, functional React component as a TSX string. It should be a single file with all imports. It must use shadcn-ui components and Tailwind CSS for styling, referencing the design tokens. The root element must have className="p-8 h-full flex flex-col items-center justify-center".'),
  designTokens: z.string().describe('A CSS snippet containing :root CSS variables for design tokens (e.g., colors, fonts) reflecting the described app. This should include --background, --foreground, --primary, --primary-foreground, --secondary, --secondary-foreground, --accent, --accent-foreground, --card, --card-foreground, --muted, --muted-foreground, --border, --input, --ring, and --radius.'),
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
  prompt: `You are an expert web designer and developer, specializing in creating beautiful and functional user interfaces with React, TypeScript, and Tailwind CSS. You will be given an "app" description and your task is to generate a complete, single-file React component (.tsx) and a set of corresponding design tokens (CSS variables).

Follow these instructions carefully:

1.  **Analyze the App:** First, think about the provided app. Break it down into design principles. What colors, typography, spacing, and imagery come to mind? Document these thoughts in the 'thoughts' output field. For example, for "minimalist workspace," you might think: "Neutral color palette, clean lines, lots of white space, simple sans-serif font, no unnecessary decoration."

2.  **Design Tokens:** Based on your analysis, create a set of CSS variables for a dark theme.
    *   The design tokens MUST be provided as CSS variables inside a \`:root\` block.
    *   You MUST include definitions for all of the following variables: \`--background\`, \`--foreground\`, \`--primary\`, \`--primary-foreground\`, \`--secondary\`, \`--secondary-foreground\`, \`--accent\`, \`--accent-foreground\`, \`--card\`, \`--card-foreground\`, \`--muted\`, \`--muted-foreground\`, \`--border\`, \`--input\`, \`--ring\`, and \`--radius\`.
    *   All colors MUST be in HSL format (e.g., \`205 90% 61%\`).
    *   The \`--background\` should be a very dark color, close to black.

3.  **React Component (TSX):** Now, create a single, complete React component in a TSX string.
    *   The component must be named \`AppComponent\`.
    *   It must be a functional component.
    *   It MUST import necessary components from libraries like \`lucide-react\`, \`@/components/ui/button\`, \`@/components/ui/card\`, etc. Assume all shadcn/ui components are available.
    *   Style the component using Tailwind CSS classes. The classes should use the variables you defined in the design tokens (e.g., \`bg-background\`, \`text-primary\`, \`border-border\`).
    *   The component should be visually interesting and clearly demonstrate the requested app. It should not be a simple placeholder. Create a small, self-contained example UI.
    *   The root element of the component MUST have the className \`"p-8 h-full flex flex-col items-center justify-center"\`. This is critical for layout.
    *   Ensure the component is fully self-contained in the TSX string, including all necessary imports. Do NOT include the \`'use client'\` directive.

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
        input: { appDescription: input.appDescription, model: input.model },
        output: { schema: prompt.output?.schema! },
      }
    );
    return output;
  }
);
