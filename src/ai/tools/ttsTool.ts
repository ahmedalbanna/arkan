// ttsTool.ts

import axios from 'axios';
import { ai } from '../genkit';

export const ttsTool = ai.defineTool(
  {
    name: 'textToSpeech',
    description: 'يستخدم لتحويل نص إلى ملف صوتي (WAV).',
    input: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'النص المراد تحويله إلى كلام.' },
      },
      required: ['text'],
    },
    output: { type: 'string' }, // هنا سنعيد رابط الملف الصوتي
  },
  async ({ text }) => {
    try {
      const response = await axios.post('http://185.190.140.93:8001/api/tts', { text });
      
      // نفترض أن الخادم يعيد رابط الملف الصوتي
      return `Speech generation successful. File path: ${response.data.file_url}`; 
      
    } catch (error) {
      throw new Error(`TTS service failed: ${error.message}`);
    }
  }
);