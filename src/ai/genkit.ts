
import { genkit } from 'genkit';
import { ollama } from 'genkitx-ollama';
import { ollamaConfig } from '@/lib/config';

export const ai = genkit({
  plugins: [
    ollama({
      models: [
        {
          name: 'gemma:2b',
          type: 'generate', // type: 'chat' | 'generate' | undefined
        },
      ],
      serverAddress: ollamaConfig.serverAddress,
    }),
  ],
});
