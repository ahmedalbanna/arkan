
'use client';

import EditorLayout from '@/components/editor/EditorLayout';
import { useSearchParams } from 'next/navigation';

export default function EditorPageWrapper() {
  const searchParams = useSearchParams();
  const fileType = searchParams.get('type') || 'word'; // Default to 'word'

  // Validate fileType to prevent unexpected values
  const validFileTypes = ['word', 'powerpoint', 'excel'];
  const editorFileType = validFileTypes.includes(fileType) ? fileType as 'word' | 'powerpoint' | 'excel' : 'word';
  
  return <EditorLayout fileType={editorFileType} />;
}
