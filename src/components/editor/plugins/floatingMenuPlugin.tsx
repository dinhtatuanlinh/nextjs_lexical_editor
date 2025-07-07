import { $isCodeHighlightNode } from '@lexical/code';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import {
	$getSelection,
	$isRangeSelection,
	$isTextNode,
	COMMAND_PRIORITY_LOW,
	FORMAT_TEXT_COMMAND,
	LexicalEditor,
	SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import CodeIcon from '@mui/icons-material/Code';
import FormatBoldOutlinedIcon from '@mui/icons-material/FormatBoldOutlined';
import FormatItalicOutlinedIcon from '@mui/icons-material/FormatItalicOutlined';
import FormatUnderlinedOutlinedIcon from '@mui/icons-material/FormatUnderlinedOutlined';
import InsertLinkOutlinedIcon from '@mui/icons-material/InsertLinkOutlined';
import StrikethroughSOutlinedIcon from '@mui/icons-material/StrikethroughSOutlined';

import { Box, IconButton, styled } from '@mui/material';
import { getDOMRangeRect } from '../common/utils/getDOMRangeRect';
import { getSelectedNode } from '../common/utils/getSelectNode';
import { setFloatingElemPosition } from '../common/utils/setFloatingElemPosition';

export const FloatingDivContainer = styled(Box)({
	display: 'flex',
	background: '#fff',
	padding: 4,
	verticalAlign: 'middle',
	position: 'absolute',
	top: 0,
	left: 0,
	zIndex: 1000,
	opacity: 0,
	backgroundColor: '#fff',
	boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.3)',
	borderRadius: 8,
	transition: 'opacity 0.5s',
	height: 35,
	willChange: 'transform',
});

function TextFormatFloatingToolbar({
	editor,
	anchorElem,
	isLink,
	isBold,
	isItalic,
	isUnderline,
	isCode,
	isStrikethrough,
	isSubscript,
	isSuperscript,
}: {
	editor: LexicalEditor;
	anchorElem: HTMLElement;
	isLink: boolean;
	isBold: boolean;
	isItalic: boolean;
	isUnderline: boolean;
	isCode: boolean;
	isStrikethrough: boolean;
	isSubscript: boolean;
	isSuperscript: boolean;
}) {
	const popupCharStylesEditorRef = useRef<HTMLDivElement>(null);

	const insertLink = useCallback(() => {
		if (!isLink) {
			editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
		} else {
			editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
		}
	}, [editor, isLink]);

	function mouseMoveListener(e: MouseEvent) {
		if (
			popupCharStylesEditorRef?.current &&
			(e.buttons === 1 || e.buttons === 3)
		) {
			popupCharStylesEditorRef.current.style.pointerEvents = 'none';
		}
	}
	function mouseUpListener(e: MouseEvent) {
		if (popupCharStylesEditorRef?.current) {
			popupCharStylesEditorRef.current.style.pointerEvents = 'auto';
		}
	}

	useEffect(() => {
		if (popupCharStylesEditorRef?.current) {
			document.addEventListener('mousemove', mouseMoveListener);
			document.addEventListener('mouseup', mouseUpListener);

			return () => {
				document.removeEventListener('mousemove', mouseMoveListener);
				document.removeEventListener('mouseup', mouseUpListener);
			};
		}
	}, [popupCharStylesEditorRef]);

	const updateTextFormatFloatingToolbar = useCallback(() => {
		const selection = $getSelection();

		const popupCharStylesEditorElem = popupCharStylesEditorRef.current;
		const nativeSelection = window.getSelection();

		if (popupCharStylesEditorElem === null) {
			return;
		}

		const rootElement = editor.getRootElement();
		if (
			selection !== null &&
			nativeSelection !== null &&
			!nativeSelection.isCollapsed &&
			rootElement !== null &&
			rootElement.contains(nativeSelection.anchorNode)
		) {
			const rangeRect = getDOMRangeRect(nativeSelection, rootElement);

			setFloatingElemPosition(
				rangeRect,
				popupCharStylesEditorElem,
				anchorElem
			);
		}
	}, [editor, anchorElem]);

	useEffect(() => {
		const scrollerElem = anchorElem.parentElement;

		const update = () => {
			editor.getEditorState().read(() => {
				updateTextFormatFloatingToolbar();
			});
		};

		window.addEventListener('resize', update);
		if (scrollerElem) {
			scrollerElem.addEventListener('scroll', update);
		}

		return () => {
			window.removeEventListener('resize', update);
			if (scrollerElem) {
				scrollerElem.removeEventListener('scroll', update);
			}
		};
	}, [editor, updateTextFormatFloatingToolbar, anchorElem]);

	useEffect(() => {
		editor.getEditorState().read(() => {
			updateTextFormatFloatingToolbar();
		});
		return mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					updateTextFormatFloatingToolbar();
				});
			}),

			editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				() => {
					updateTextFormatFloatingToolbar();
					return false;
				},
				COMMAND_PRIORITY_LOW
			)
		);
	}, [editor, updateTextFormatFloatingToolbar]);

	return (
		<FloatingDivContainer ref={popupCharStylesEditorRef}>
			{editor.isEditable() && (
				<>
					<IconButton
						onClick={() => {
							editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
						}}
						color={isBold ? 'secondary' : undefined}
					>
						<FormatBoldOutlinedIcon />
					</IconButton>

					<IconButton
						onClick={() => {
							editor.dispatchCommand(
								FORMAT_TEXT_COMMAND,
								'italic'
							);
						}}
						color={isItalic ? 'secondary' : undefined}
					>
						<FormatItalicOutlinedIcon />
					</IconButton>

					<IconButton
						onClick={() => {
							editor.dispatchCommand(
								FORMAT_TEXT_COMMAND,
								'underline'
							);
						}}
						color={isUnderline ? 'secondary' : undefined}
					>
						<FormatUnderlinedOutlinedIcon />
					</IconButton>

					<IconButton
						onClick={() => {
							editor.dispatchCommand(
								FORMAT_TEXT_COMMAND,
								'strikethrough'
							);
						}}
						color={isStrikethrough ? 'secondary' : undefined}
					>
						<StrikethroughSOutlinedIcon />
					</IconButton>

					<IconButton
						onClick={() => {
							editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
						}}
						color={isCode ? 'secondary' : undefined}
					>
						<CodeIcon />
					</IconButton>

					<IconButton
						onClick={insertLink}
						color={isLink ? 'secondary' : undefined}
					>
						<InsertLinkOutlinedIcon />
					</IconButton>
				</>
			)}
		</FloatingDivContainer>
	);
}

function useFloatingTextFormatToolbar(editor: LexicalEditor) {
	const [isText, setIsText] = useState(false);
	const [isLink, setIsLink] = useState(false);
	const [isBold, setIsBold] = useState(false);
	const [isItalic, setIsItalic] = useState(false);
	const [isUnderline, setIsUnderline] = useState(false);
	const [isStrikethrough, setIsStrikethrough] = useState(false);
	const [isSubscript, setIsSubscript] = useState(false);
	const [isSuperscript, setIsSuperscript] = useState(false);
	const [isCode, setIsCode] = useState(false);
	const [isMounted, setIsMounted] = useState(false);

	const updatePopup = useCallback(() => {
		editor.getEditorState().read(() => {
			// Should not to pop up the floating toolbar when using IME input
			if (editor.isComposing()) {
				return;
			}
			const selection = $getSelection();
			const nativeSelection = window.getSelection();
			const rootElement = editor.getRootElement();

			if (
				nativeSelection !== null &&
				(!$isRangeSelection(selection) ||
					rootElement === null ||
					!rootElement.contains(nativeSelection.anchorNode))
			) {
				setIsText(false);
				return;
			}

			if (!$isRangeSelection(selection)) {
				return;
			}

			const node = getSelectedNode(selection);

			// Update text format
			setIsBold(selection.hasFormat('bold'));
			setIsItalic(selection.hasFormat('italic'));
			setIsUnderline(selection.hasFormat('underline'));
			setIsStrikethrough(selection.hasFormat('strikethrough'));
			setIsSubscript(selection.hasFormat('subscript'));
			setIsSuperscript(selection.hasFormat('superscript'));
			setIsCode(selection.hasFormat('code'));

			// Update links
			const parent = node.getParent();
			if ($isLinkNode(parent) || $isLinkNode(node)) {
				setIsLink(true);
			} else {
				setIsLink(false);
			}

			if (
				!$isCodeHighlightNode(selection.anchor.getNode()) &&
				selection.getTextContent() !== ''
			) {
				setIsText($isTextNode(node));
			} else {
				setIsText(false);
			}

			const rawTextContent = selection
				.getTextContent()
				.replace(/\n/g, '');
			if (!selection.isCollapsed() && rawTextContent === '') {
				setIsText(false);
				return;
			}
		});
	}, [editor]);

	useEffect(() => {
		document.addEventListener('selectionchange', updatePopup);
		return () => {
			document.removeEventListener('selectionchange', updatePopup);
		};
	}, [updatePopup]);

	useEffect(() => {
		return mergeRegister(
			editor.registerUpdateListener(() => {
				updatePopup();
			}),
			editor.registerRootListener(() => {
				if (editor.getRootElement() === null) {
					setIsText(false);
				}
			})
		);
	}, [editor, updatePopup]);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted || !isText || isLink) {
		return null;
	}

	return createPortal(
		<TextFormatFloatingToolbar
			editor={editor}
			anchorElem={document.body}
			isLink={isLink}
			isBold={isBold}
			isItalic={isItalic}
			isStrikethrough={isStrikethrough}
			isSubscript={isSubscript}
			isSuperscript={isSuperscript}
			isUnderline={isUnderline}
			isCode={isCode}
		/>,
		document.body
	);
}

export default function FloatingTextFormatToolbarPlugin() {
	const [editor] = useLexicalComposerContext();

	return useFloatingTextFormatToolbar(editor);
}
