
import { genkit } from 'genkit';
import { ollama } from 'genkitx-ollama';


export const ai = genkit({
  plugins: [
    ollama({
      models: [
        {
          name: 'gemma:2b',
          type: 'generate', // type: 'chat' | 'generate' | undefined
        },
      ],
      serverAddress:"http://185.190.140.93:11434",
    }),
  ],
});
