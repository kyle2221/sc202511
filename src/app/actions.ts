
'use server';

import { generateCodeFromApp } from '@/ai/flows/generate-code-from-app';
import { z } from 'zod';
import { ModelId } from 'genkit';
import { promises as fs } from 'fs';
import path from 'path';

const AppSchema = z.object({
  app: z.string().min(3, { message: 'Please describe the app in at least 3 characters.' }).max(400, { message: 'Description must be 400 characters or less.' }),
  model: z.string(),
  language: z.string(),
});

export type FormState = {
  generatedCode?: string;
  terminalOutput?: string;
  error?: string;
  success?: boolean;
  componentKey?: number; // To force re-rendering of the dynamic component
};

export async function generateCode(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = AppSchema.safeParse({
    app: formData.get('app'),
    model: formData.get('model'),
    language: formData.get('language'),
  });

  if (!validatedFields.success) {
    const appError = validatedFields.error.flatten().fieldErrors.app?.[0];
    const modelError = validatedFields.error.flatten().fieldErrors.model?.[0];
    const langError = validatedFields.error.flatten().fieldErrors.language?.[0];
    return {
      error: appError || modelError || langError || 'Invalid input.',
    };
  }

  try {
    
    const result = await generateCodeFromApp({
      appDescription: validatedFields.data.app,
      model: validatedFields.data.model as ModelId,
      language: validatedFields.data.language,
    });

    const componentPath = path.join(process.cwd(), 'src', 'app', 'components', 'app-component.tsx');
    
    let componentCode = result.generatedCode;
    
    // Ensure 'use client' is present only for React components
    if (validatedFields.data.language === 'TypeScript (React) (recommended)') {
      componentCode = result.generatedCode.trim().startsWith("'use client'") || result.generatedCode.trim().startsWith('"use client"') 
        ? result.generatedCode 
        : `'use client';\n${result.generatedCode}`;
    }

    await fs.writeFile(componentPath, componentCode);

    const terminalOutput = `AI thinking...\n${result.thoughts}\n\nGeneration complete. Preview updated.`;

    return {
      generatedCode: componentCode, // Return the full component code to the client
      terminalOutput: terminalOutput,
      success: true,
      componentKey: (prevState.componentKey || 0) + 1, // Increment key to force re-render
    };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
    return {
      error: `An unexpected error occurred. The app description might be too unusual. Please try again. Details: ${errorMessage}`,
      terminalOutput: `> Generation failed!\n> ${errorMessage}`
    };
  }
}
