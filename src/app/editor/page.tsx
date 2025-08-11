
'use client';

import EditorLayout from '@/components/editor/EditorLayout';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation'; // Assuming useSearchParams is still needed here

// Dynamically import RichTextEditor with ssr: false
const RichTextEditor = dynamic(() => import('@/components/editor/RichTextEditor'), {
  ssr: false,
});

export default function EditorPageWrapper() {
  const searchParams = useSearchParams();
  const fileType = searchParams.get('type') || 'word'; // Default to 'word'

  // Validate fileType to prevent unexpected values
  const validFileTypes = ['word', 'powerpoint', 'excel'];
  const editorFileType = validFileTypes.includes(fileType) ? fileType as 'word' | 'powerpoint' | 'excel' : 'word';
  
  return <EditorLayout fileType={editorFileType} />;
}
