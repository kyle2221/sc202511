import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {openai} from 'genkit/x/openai';

export const ai = genkit({
  plugins: [
    googleAI(),
    openai({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
