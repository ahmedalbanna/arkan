

'use server';

/**
 * @fileOverview An AI agent for converting text to speech.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import wav from 'wav';

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

function chunkText(text: string, chunkSize = 4500): string[] {
    const sentences = text.match(/[^.!?]+[.!?]*/g) || [];
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > chunkSize) {
            chunks.push(currentChunk);
            currentChunk = sentence;
        } else {
            currentChunk += sentence;
        }
    }
    if (currentChunk) {
        chunks.push(currentChunk);
    }
    return chunks;
}


export const textToSpeech = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: z.object({
        text: z.string()
    }),
    outputSchema: z.object({
      audioDataUri: z.string().describe("The generated audio as a Base64 data URI."),
    }),
  },
  async ({ text }) => {
    const textChunks = chunkText(text);
    const audioBuffers: Buffer[] = [];

    for (const chunk of textChunks) {
        const { media } = await ai.generate({
          model: 'googleai/gemini-2.5-flash-preview-tts',
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Algenib' },
              },
            },
          },
          prompt: chunk,
        });

        if (media && media.url) {
            const audioBuffer = Buffer.from(
              media.url.substring(media.url.indexOf(',') + 1),
              'base64'
            );
            audioBuffers.push(audioBuffer);
        }
    }
    
    if (audioBuffers.length === 0) {
      throw new Error("Text-to-speech generation failed to produce any audio.");
    }

    const combinedBuffer = Buffer.concat(audioBuffers);
    const wavBase64 = await toWav(combinedBuffer);

    return { audioDataUri: `data:audio/wav;base64,${wavBase64}` };
  }
);
