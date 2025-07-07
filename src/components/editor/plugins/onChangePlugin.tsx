import { $generateHtmlFromNodes } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";
import { useEffect } from "react";
import { ImageNode } from "../nodes/imageNode";


export const OnChangePlugin = ({ onChange }: { onChange: (content: string) => void }) => {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        if (!editor.hasNodes([ImageNode])) {
            throw new Error('ImageNode not registered on editor');
        }

        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const html = $generateHtmlFromNodes(editor, null);
                onChange(html);
            });
        });
    }, [editor, onChange]);

    return null;
}