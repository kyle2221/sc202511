import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-existing-code.ts';
import '@/ai/flows/refine-generated-code.ts';
import '@/ai/flows/generate-code-from-app.ts';
