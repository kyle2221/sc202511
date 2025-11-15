'use server';

import { generateCodeFromVibe } from '@/ai/flows/generate-code-from-vibe';
import { z } from 'zod';
import { ModelId } from 'genkit/ai';

const VibeSchema = z.object({
  vibe: z.string().min(10, { message: 'Please describe the vibe in at least 10 characters.' }).max(400, { message: 'Description must be 400 characters or less.' }),
  model: z.string().optional(),
});

export type FormState = {
  tsxCode?: string;
  designTokens?: string;
  terminalOutput?: string;
  error?: string;
  success?: boolean;
};

export async function generateCode(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = VibeSchema.safeParse({
    vibe: formData.get('vibe'),
    model: formData.get('model'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.vibe?.[0],
    };
  }

  try {
    const selectedModel = validatedFields.data.model && validatedFields.data.model !== 'auto'
      ? validatedFields.data.model as ModelId
      : undefined;

    // We can't stream the response to the client action directly yet,
    // so we'll await the full response here.
    const result = await generateCodeFromVibe({
      vibeDescription: validatedFields.data.vibe,
      model: selectedModel,
    });

    const terminalOutput = `AI thinking...\n${result.thoughts}\n\nGenerating code...\n\n${result.tsxCode}`;

    return {
      tsxCode: result.tsxCode,
      designTokens: result.designTokens,
      terminalOutput: terminalOutput,
      success: true,
    };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
    return {
      error: `An unexpected error occurred. The vibe might be too unusual. Please try again. Details: ${errorMessage}`,
      terminalOutput: `> Generation failed!\n> ${errorMessage}`
    };
  }
}
