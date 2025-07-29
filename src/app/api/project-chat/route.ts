
import { runFlow } from '@genkit-ai/next/server';
import { projectChat } from '@/ai/flows/project-chat';

export const POST = runFlow(projectChat, {
  auth: {
    // You can also add `admin: true` to require admin privileges.
    // The `user` object will be available in the flow's context.
  },
});
