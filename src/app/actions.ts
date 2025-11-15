'use server';

import { generateCodeFromVibe } from '@/ai/flows/generate-code-from-vibe';
import { z } from 'zod';

const VibeSchema = z.object({
  vibe: z.string().min(10, { message: 'Please describe the vibe in at least 10 characters.' }).max(400, { message: 'Description must be 400 characters or less.' }),
});

export type FormState = {
  cssSnippet?: string;
  designTokens?: string;
  error?: string;
  success?: boolean;
};

export async function generateCode(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = VibeSchema.safeParse({
    vibe: formData.get('vibe'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.vibe?.[0],
    };
  }

  try {
    const result = await generateCodeFromVibe({
      vibeDescription: validatedFields.data.vibe,
    });
    return {
      cssSnippet: result.cssSnippet,
      designTokens: result.designTokens,
      success: true,
    };
  } catch (e) {
    console.error(e);
    return {
      error: 'An unexpected error occurred. The vibe might be too unusual. Please try again.',
    };
  }
}
