import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useImperativeHandle } from 'react';
import { LexicalEditor as LexicalEditorInstance } from 'lexical';

export default function EditorRefPlugin({
	refObject,
}: {
	refObject: React.Ref<LexicalEditorInstance | null>;
}) {
	const [editor] = useLexicalComposerContext();

	useImperativeHandle(refObject, () => editor, [editor]);

	return null;
}
