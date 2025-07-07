import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ReactElement, useEffect } from 'react';
import { ImageNode } from '../nodes/imageNode';

export default function ImagePlugin(): ReactElement | null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([ImageNode])) {
            throw new Error('ImagePlugin: ImageNode not registered on editor');
        }

        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {});
        });
    }, [editor]);

    return null;
}