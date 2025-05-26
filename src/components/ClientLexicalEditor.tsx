'use client';

import dynamic from 'next/dynamic';
import { useRef } from 'react';

const LexicalEditor = dynamic(() => import('./lexicalEditor'), {
  ssr: false,
});

export default function ClientLexicalEditor() {
  const editorRef = useRef<any>(null);

  const getEditorContent = () => {
    if (editorRef.current) {
      editorRef.current.getContent();
    }
  };

  return (
    <>
      <LexicalEditor ref={editorRef} />
      <button 
        onClick={getEditorContent}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Log Content
      </button>
    </>
  );
} 