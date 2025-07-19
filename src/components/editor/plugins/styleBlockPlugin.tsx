// plugins/StyledBlockPlugin.tsx
import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_STYLED_BLOCK_COMMAND } from '../commands/insertStyledBlock';
import { $createStyledBlockNodeWithParagraph } from '../nodes/styledBlockNode';
import {
	$getSelection,
	$getRoot,
	COMMAND_PRIORITY_EDITOR,
	$createParagraphNode,
} from 'lexical';

export default function StyledBlockPlugin() {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		// registerCommand returns an unsubscribe function,
		// so returning it from useEffect cleans up on unmount.
		return editor.registerCommand(
			INSERT_STYLED_BLOCK_COMMAND,
			(payload) => {
				editor.update(() => {
					const block = $createStyledBlockNodeWithParagraph(
						'note-box',
						{
							backgroundColor: 'lavender',
							padding: '14px',
						}
					);

					const selection = $getSelection();
					if (selection?.insertNodes) {
						selection.insertNodes([block]);
					} else {
						$getRoot().append(block);
					}

					// 👉 create an empty paragraph after the block
					const trailing = $createParagraphNode();
					block.insertAfter(trailing);

					// move caret into the first paragraph inside the block
					block.getFirstChild()?.selectStart();
				});
				return true; // signal that we handled the command
			},
			COMMAND_PRIORITY_EDITOR
		);
	}, [editor]);

	return null; // plugin has no UI
}
