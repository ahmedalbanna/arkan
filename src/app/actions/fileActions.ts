
'use server';

import { imageToText } from '@/ai/flows/image-to-text';
import { rewriteDocumentToMarkdown } from '@/ai/flows/rewrite-document-to-markdown';
import { requireUser } from './_utils/auth';
import { deductCredit } from './userActions';
import { logGeneration } from './analyticsActions';

const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
  'text/markdown',
];

export async function processFileAction(formData: FormData) {
  const user = await requireUser();
  const file = formData.get('file') as File | null;
  if (!file) throw new Error('No file uploaded.');
  if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type. Supported types are: ${SUPPORTED_MIME_TYPES.join(', ')}`);
  }
  await deductCredit(user.id, 1);

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const dataUri = `data:${file.type};base64,${base64}`;

  let agentId = 'text-file-to-markdown';
  let markdownContent = '';

  if (file.type === 'application/pdf') {
    agentId = 'pdf-to-markdown';
    const result = await rewriteDocumentToMarkdown({ pdfDataUri: dataUri, flow: 'rewrite-document-to-markdown' });
    markdownContent = 'markdown' in result ? result.markdown : '';
  } else if (file.type.startsWith('image/')) {
    agentId = 'image-to-text';
    const result = await imageToText({ imageDataUri: dataUri, flow: 'image-to-text' });
    markdownContent = 'text' in result ? result.text : '';
  } else {
    markdownContent = Buffer.from(await file.arrayBuffer()).toString('utf-8');
  }

  await logGeneration({
    agentId,
    userId: user.id,
    input: { fileName: file.name, fileType: file.type },
    output: { markdownLength: markdownContent.length },
    creditCost: 1,
  });

  return { markdown: markdownContent };
}
