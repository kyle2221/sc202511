'use server';

import { generateCodeFromVibe } from '@/ai/flows/generate-code-from-vibe';
import { z } from 'zod';
import { ModelId } from 'genkit/ai';
import { promises as fs } from 'fs';
import path from 'path';

const VibeSchema = z.object({
  vibe: z.string().min(3, { message: 'Please describe the vibe in at least 3 characters.' }).max(400, { message: 'Description must be 400 characters or less.' }),
});

export type FormState = {
  tsxCode?: string;
  designTokens?: string;
  terminalOutput?: string;
  error?: string;
  success?: boolean;
  componentKey?: number; // To force re-rendering of the dynamic component
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

    const componentPath = path.join(process.cwd(), 'src', 'app', 'components', 'vibe-component.tsx');
    // Ensure the generated code has 'use client' at the top
    const componentCode = result.tsxCode.trim().startsWith("'use client'") || result.tsxCode.trim().startsWith('"use client"') 
      ? result.tsxCode 
      : `'use client';\n${result.tsxCode}`;

    await fs.writeFile(componentPath, componentCode);

    const terminalOutput = `AI thinking...\n${result.thoughts}\n\nGenerating component...\nComponent written to src/app/components/vibe-component.tsx`;

    return {
      tsxCode: result.tsxCode,
      designTokens: result.designTokens,
      terminalOutput: terminalOutput,
      success: true,
      componentKey: (prevState.componentKey || 0) + 1, // Increment key to force re-render
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
