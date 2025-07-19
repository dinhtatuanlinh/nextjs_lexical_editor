import {
	COMMAND_PRIORITY_LOW,
	KEY_BACKSPACE_COMMAND,
	$getSelection,
	RangeSelection,
	$isRangeSelection,
	$isParagraphNode,
	KEY_ENTER_COMMAND,
	$createParagraphNode,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { $isStyledBlockNode } from '../nodes/styledBlockNode';

export function StyledBlockBehaviourPlugin() {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		// --- Enter: if caret is at end of last child, create paragraph after block
		// const removeEnter = editor.registerCommand(
		// 	KEY_ENTER_COMMAND,
		// 	(event, editor) => {
		// 		const selection = $getSelection();
		// 		if (!$isRangeSelection(selection)) return false;

		// 		const anchorNode = selection.anchor.getNode();
		// 		const paragraph = $isParagraphNode(anchorNode)
		// 			? anchorNode
		// 			: anchorNode.getParentOrThrow();

		// 		const block = paragraph.getParent();
		// 		if (!$isStyledBlockNode(block)) return false;

		// 		// caret must be at very end of last child
		// 		if (
		// 			selection.isCollapsed() &&
		// 			paragraph.is(block.getLastChild()) &&
		// 			selection.anchor.offset === paragraph.getTextContentSize()
		// 		) {
		// 			const newPara = $createParagraphNode();
		// 			block.insertAfter(newPara);
		// 			newPara.selectStart();
		// 			return true; // we handled it
		// 		}
		// 		return false;
		// 	},
		// 	COMMAND_PRIORITY_LOW
		// );

		// --- Back-space: if inner paragraph is empty, delete whole block
		const removeBackspace = editor.registerCommand(
			KEY_BACKSPACE_COMMAND,
			(payload, editor) => {
				const selection = $getSelection();
				if (!$isRangeSelection(selection)) return false;

				if (!selection.isCollapsed()) return false;

				const paragraph = selection.anchor.getNode();
				if (!$isParagraphNode(paragraph)) return false;
				
				if (paragraph.getTextContentSize() !== 0) return false;
				
				const block = paragraph.getParent();
				if (!$isStyledBlockNode(block)) return false;
				const count = block.getChildrenSize();
				if (count > 1) return false;
				// delete entire block
				block.remove();
				return true;
			},
			COMMAND_PRIORITY_LOW
		);

		return () => {
			// removeEnter();
			removeBackspace();
		};
	}, [editor]);

	return null;
}
