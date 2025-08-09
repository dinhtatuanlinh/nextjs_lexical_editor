import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { $getRoot } from 'lexical';

function PrintJSONPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
		const json = editor
							.getEditorState()
							.toJSON();
        const jsonString = JSON.stringify(json, null, 2);
        console.log('Editor JSON:', jsonString);
      });
    });
  }, [editor]);

  return null;
}

export default PrintJSONPlugin;