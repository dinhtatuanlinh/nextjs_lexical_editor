import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
	$createHeadingNode,
	$isHeadingNode,
	HeadingTagType,
} from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { mergeRegister } from '@lexical/utils';
import {
	$createParagraphNode,
	$getRoot,
	$getSelection,
	$insertNodes,
	$isParagraphNode,
	$isRangeSelection,
	CAN_REDO_COMMAND,
	CAN_UNDO_COMMAND,
	ElementFormatType,
	FORMAT_ELEMENT_COMMAND,
	FORMAT_TEXT_COMMAND,
	INDENT_CONTENT_COMMAND,
	LexicalNode,
	OUTDENT_CONTENT_COMMAND,
	REDO_COMMAND,
	UNDO_COMMAND,
} from 'lexical';
import { Image as ImageIcon } from 'lucide-react';
import React, { useCallback, useContext, useState } from 'react';
import { BsCodeSlash, BsTypeStrikethrough } from 'react-icons/bs';
import {
	CiTextAlignCenter,
	CiTextAlignJustify,
	CiTextAlignLeft,
	CiTextAlignRight,
} from 'react-icons/ci';
import { FaAlignCenter, FaAlignLeft, FaAlignRight } from 'react-icons/fa';
import { HiLink, HiLinkSlash } from 'react-icons/hi2';
import { LuRedo, LuUndo } from 'react-icons/lu';
import {
	PiHighlighterLight,
	PiTextIndentThin,
	PiTextOutdentThin,
} from 'react-icons/pi';
import { TbSubscript, TbSuperscript } from 'react-icons/tb';
import ImageManager from '../components/imageManager';
import { ImageNodeClickContext } from '../lexicalEditor';
import { $createImageNode, ImageNode } from '../nodes/imageNode';
import { $createFlexRowNode } from '../nodes/flexRowNode';

export default function ToolbarPlugin<
	T extends { imageId: number; name: string; link: string; type: string },
	R extends { images: T[]; totalPages: number }
>({
	handleGetImages,
	handleUploadImage,
	apiHost,
}: {
	handleGetImages: (pageNumber: number) => Promise<R>;
	handleUploadImage: (file: File, fileName: string) => Promise<void>;
	apiHost: string;
}) {
	const [editor] = useLexicalComposerContext();
	// check bold, italic, underline
	const [isBold, setIsBold] = useState(false);
	const [isItalic, setIsItalic] = useState(false);
	const [isUnderline, setIsUnderline] = useState(false);
	const [isCode, setIsCode] = useState(false);
	const [isHighLight, setIsHighLight] = useState(false);
	const [isStrikethrough, setIsStrikethrough] = useState(false);
	const [isSubscript, setIsSubscript] = useState(false);
	const [isSuperscript, setIsSuperscript] = useState(false);
	const [isLeft, setIsLeft] = useState(false);
	const [isCenter, setIsCenter] = useState(false);
	const [isRight, setIsRight] = useState(false);
	const [isJustify, setIsJustify] = useState(false);
	const [isOutdent, setIsOutdent] = useState(false);
	const [isIndent, setIsIndent] = useState(false);
	const [canUndo, setCanUndo] = useState(false);
	const [canRedo, setCanRedo] = useState(false);
	const [isH1, setIsH1] = useState(false);
	const [isH2, setIsH2] = useState(false);
	const [isH3, setIsH3] = useState(false);
	const [isParagraph, setIsParagraph] = useState(false);
	const [imageManagerOpen, setImageManagerOpen] = useState(false);

	const [showInput, setShowInput] = useState(false);
	const [url, setUrl] = useState('');

	const imageNodeClickCtx = useContext(ImageNodeClickContext);
	const lastClickedImageKey = imageNodeClickCtx?.lastClickedImageKey;
	const [selectedImageAlignment, setSelectedImageAlignment] = useState<
		'left' | 'center' | 'right'
	>('left');

	const $updateToolbar = useCallback(() => {
		const selection = $getSelection();

		if ($isRangeSelection(selection)) {
			setIsBold(selection.hasFormat('bold'));
			setIsItalic(selection.hasFormat('italic'));
			setIsUnderline(selection.hasFormat('underline'));
			setIsCode(selection.hasFormat('code'));
			setIsHighLight(selection.hasFormat('highlight'));
			setIsStrikethrough(selection.hasFormat('strikethrough'));
			setIsSubscript(selection.hasFormat('subscript'));
			setIsSuperscript(selection.hasFormat('superscript'));

			// Alignment check
			const anchorNode = selection.anchor.getNode();
			const element = anchorNode.getTopLevelElementOrThrow();
			const format = element.getFormat
				? element.getFormat()
				: element.__format;
			setIsLeft(format === 1 || format === 1);
			setIsCenter(format === 2);
			setIsRight(format === 3);
			setIsJustify(format === 4);

			// Indent check
			const indent = element.getIndent
				? element.getIndent()
				: element.__indent;
			setIsIndent(!!indent && indent > 0);
			setIsOutdent(!indent || indent === 0);

			// Heading check
			if ($isHeadingNode(element)) {
				setIsH1(element.getTag() === 'h1');
				setIsH2(element.getTag() === 'h2');
				setIsH3(element.getTag() === 'h3');
				setIsParagraph(false);
			}
			if ($isParagraphNode(element)) {
				setIsH1(false);
				setIsH2(false);
				setIsH3(false);
				setIsParagraph(true);
			}
		}
	}, []);

	React.useEffect(() => {
		return mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					$updateToolbar();
				});
			}),
			editor.registerCommand(
				CAN_UNDO_COMMAND,
				(payload) => {
					setCanUndo(payload);
					return false;
				},
				1
			),
			editor.registerCommand(
				CAN_REDO_COMMAND,
				(payload) => {
					setCanRedo(payload);
					return false;
				},
				1
			)
		);
	}, [editor, $updateToolbar]);

	const handleHeadingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const heading = e.target.value;
		editor.update(() => {
			const selection = $getSelection();

			if ($isRangeSelection(selection)) {
				$setBlocksType(selection, () =>
					$createHeadingNode(heading as HeadingTagType)
				);
			}
		});
	};

	const handleAlignChange = (formatType: ElementFormatType) => {
		editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, formatType);
	};
	const handleInsertLink = () => {
		editor.update(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
			}
		});
		setShowInput(false);
		setUrl('');
	};
	const handleRemoveLink = () => {
		editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
	};

	const handleOpenImageManager = () => {
		setImageManagerOpen(true);
	};

	const handleInsertImageFromManager = (
		url: string,
		alignment?: 'left' | 'center' | 'right'
	) => {
		setImageManagerOpen(false);
		if (url && editor) {
			editor.focus();
			editor.update(() => {
				const selection = $getSelection();
				const nodes = selection?.getNodes();

				// Create image node
				const imageNode = $createImageNode({
					src: url,
					altText: '',
					alignment,
				});

				// Create a new paragraph node for the image
				const paragraphNode = $createParagraphNode();
				paragraphNode.append(imageNode);

				// Insert at selection or at the end
				if (selection && nodes?.length) {
					const topLevelNode = nodes[0].getTopLevelElement();
					if (topLevelNode) {
						topLevelNode.insertAfter(paragraphNode);
					}
				} else {
					// If no selection, append to the end
					const root = $getRoot();
					root.append(paragraphNode);
				}

				// Add an empty paragraph after the image
				const newParagraph = $createParagraphNode();
				paragraphNode.insertAfter(newParagraph);
				newParagraph.select();
			});
		}
	};

	React.useEffect(() => {
		if (!lastClickedImageKey) return;
		editor.getEditorState().read(() => {
			function findNodeByKey(
				node: LexicalNode | null,
				key: string
			): LexicalNode | null {
				if (!node) return null;
				if (
					'getKey' in node &&
					typeof node.getKey === 'function' &&
					node.getKey() === key
				)
					return node;
				if (
					'getChildren' in node &&
					typeof node.getChildren === 'function'
				) {
					for (const child of node.getChildren()) {
						const found = findNodeByKey(child, key);
						if (found) return found;
					}
				}
				return null;
			}

			const root = $getRoot();
			const node = findNodeByKey(root, lastClickedImageKey);
			if (node && node instanceof ImageNode && node.__alignment) {
				setSelectedImageAlignment(node.__alignment);
			}
			console.log('lastClickedImageKey @@@@@');
		});
	}, [lastClickedImageKey, editor]);

	const setImageAlignment = (alignment: 'left' | 'center' | 'right') => {
		if (!lastClickedImageKey) return;
		editor.update(() => {
			function findNodeByKey(
				node: LexicalNode | null,
				key: string
			): LexicalNode | null {
				if (!node) return null;
				if (
					'getKey' in node &&
					typeof node.getKey === 'function' &&
					node.getKey() === key
				)
					return node;
				if (
					'getChildren' in node &&
					typeof node.getChildren === 'function'
				) {
					for (const child of node.getChildren()) {
						const found = findNodeByKey(child, key);
						if (found) return found;
					}
				}
				return null;
			}

			const root = $getRoot();
			const node = findNodeByKey(root, lastClickedImageKey);
			if (node && node instanceof ImageNode) {
				const newNode = new ImageNode(
					node.__src,
					node.__altText,
					alignment,
					undefined
				);
				node.replace(newNode);
				setSelectedImageAlignment(alignment);
			}
		});
	};

	return (
		<div className="flex flex-wrap gap-2 border-b p-2 bg-gray-100 sticky top-0 z-30">
			<div className="flex space-x-1 border-r pr-2">
				<button
					type="button"
					disabled={!canUndo}
					onClick={() =>
						editor.dispatchCommand(UNDO_COMMAND, undefined)
					}
					className={`toolbar-item spaced disabled:text-gray-500 px-2 py-1 border rounded text-black`}
					aria-label="Undo"
				>
					<LuUndo />
				</button>
				<button
					type="button"
					disabled={!canRedo}
					onClick={() =>
						editor.dispatchCommand(REDO_COMMAND, undefined)
					}
					className={`toolbar-item spaced disabled:text-gray-500 px-2 py-1 border rounded text-black`}
					aria-label="Redo"
				>
					<LuRedo />
				</button>
			</div>

			<div className="flex space-x-1 border-r pr-2">
				<button
					type="button"
					onClick={() =>
						editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
					}
					className={`${
						isBold ? 'bg-blue-200' : 'hover:bg-gray-200'
					} px-2 py-1 border rounded text-black font-semibold`}
				>
					B
				</button>
				<button
					type="button"
					onClick={() =>
						editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
					}
					className={`${
						isItalic ? 'bg-blue-200' : 'hover:bg-gray-200'
					} px-2 py-1 border rounded text-black italic`}
				>
					I
				</button>
				<button
					type="button"
					onClick={() =>
						editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
					}
					className={`${
						isUnderline ? 'bg-blue-200' : 'hover:bg-gray-200'
					} px-2 py-1 border rounded text-black underline`}
				>
					U
				</button>
				<button
					type="button"
					onClick={() =>
						editor.dispatchCommand(
							FORMAT_TEXT_COMMAND,
							'strikethrough'
						)
					}
					className={`${
						isStrikethrough ? 'bg-blue-200' : 'hover:bg-gray-200'
					} px-2 py-1 border rounded text-black`}
				>
					<BsTypeStrikethrough />
				</button>
				<button
					type="button"
					onClick={() =>
						editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')
					}
					className={`${
						isCode ? 'bg-blue-200' : 'hover:bg-gray-200'
					} px-2 py-1 border rounded text-black`}
				>
					<BsCodeSlash />
				</button>
				<button
					type="button"
					onClick={() =>
						editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'highlight')
					}
					className={`${
						isHighLight ? 'bg-blue-200' : 'hover:bg-gray-200'
					} px-2 py-1 border rounded text-black`}
				>
					<PiHighlighterLight />
				</button>
				<button
					type="button"
					onClick={() =>
						editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript')
					}
					className={`${
						isSubscript ? 'bg-blue-200' : 'hover:bg-gray-200'
					} px-2 py-1 border rounded text-black`}
				>
					<TbSubscript />
				</button>
				<button
					type="button"
					onClick={() =>
						editor.dispatchCommand(
							FORMAT_TEXT_COMMAND,
							'superscript'
						)
					}
					className={`${
						isSuperscript ? 'bg-blue-200' : 'hover:bg-gray-200'
					} px-2 py-1 border rounded text-black`}
				>
					<TbSuperscript />
				</button>
			</div>

			<div className="flex space-x-1 border-r pr-2">
				<button
					type="button"
					onClick={() => handleAlignChange('left')}
					className={`${
						isLeft ? 'bg-blue-200' : 'hover:bg-gray-200'
					}  px-2 py-1 border rounded text-black`}
				>
					<CiTextAlignLeft />
				</button>
				<button
					type="button"
					onClick={() => handleAlignChange('center')}
					className={`${
						isCenter ? 'bg-blue-200' : 'hover:bg-gray-200'
					}  px-2 py-1 border rounded text-black`}
				>
					<CiTextAlignCenter />
				</button>
				<button
					type="button"
					onClick={() => handleAlignChange('right')}
					className={`${
						isRight ? 'bg-blue-200' : 'hover:bg-gray-200'
					}  px-2 py-1 border rounded text-black`}
				>
					<CiTextAlignRight />
				</button>
				<button
					type="button"
					onClick={() => handleAlignChange('justify')}
					className={`${
						isJustify ? 'bg-blue-200' : 'hover:bg-gray-200'
					}  px-2 py-1 border rounded text-black`}
				>
					<CiTextAlignJustify />
				</button>
				<button
					onClick={() =>
						editor.dispatchCommand(
							OUTDENT_CONTENT_COMMAND,
							undefined
						)
					}
					className={`${
						isOutdent ? 'bg-blue-200' : 'hover:bg-gray-200'
					}  px-2 py-1 border rounded text-black`}
				>
					<PiTextOutdentThin />
				</button>
				<button
					onClick={() =>
						editor.dispatchCommand(
							INDENT_CONTENT_COMMAND,
							undefined
						)
					}
					className={`${
						isIndent ? 'bg-blue-200' : 'hover:bg-gray-200'
					}  px-2 py-1 border rounded text-black`}
				>
					<PiTextIndentThin />
				</button>
			</div>

			<div className="flex space-x-1 border-r pr-2">
				<select
					onChange={handleHeadingChange}
					value={
						isH1 ? 'h1' : isH2 ? 'h2' : isH3 ? 'h3' : 'paragraph'
					}
					className="px-2 py-1 border rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="h1">H1</option>
					<option value="h2">H2</option>
					<option value="h3">H3</option>
					<option value="paragraph">P</option>
				</select>
			</div>

			<div className="flex space-x-1 border-r pr-2">
				<button
					type="button"
					onClick={() => setShowInput((prev) => !prev)}
					className="bg-gray-200 px-2 py-1 rounded text-sm hover:bg-gray-300"
				>
					<HiLink />
				</button>
				{showInput && (
					<>
						<input
							className="border px-2 py-1 text-sm rounded"
							type="text"
							placeholder="https://example.com"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
						/>
						<button
							type="button"
							onClick={handleInsertLink}
							className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
						>
							ok
						</button>
					</>
				)}
				<button
					type="button"
					onClick={handleRemoveLink}
					className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
				>
					<HiLinkSlash />
				</button>
			</div>
			<div className="flex space-x-1 border-r pr-2">
				<button
					type="button"
					onClick={handleOpenImageManager}
					className="px-2 py-1 border rounded hover:bg-gray-200 text-black flex items-center"
				>
					<ImageIcon className="w-5 h-5" />
				</button>
			</div>
			{lastClickedImageKey && (
				<div className="flex items-center gap-1 ml-4">
					<span className="text-xs text-gray-600">Image Align:</span>
					<button
						type="button"
						className={`px-2 py-1 border rounded ${
							selectedImageAlignment === 'left'
								? 'bg-blue-200'
								: 'hover:bg-gray-200'
						} text-black`}
						onClick={() => setImageAlignment('left')}
					>
						<FaAlignLeft className="h-4 w-4" />
					</button>
					<button
						type="button"
						className={`px-2 py-1 border rounded ${
							selectedImageAlignment === 'center'
								? 'bg-blue-200'
								: 'hover:bg-gray-200'
						} text-black`}
						onClick={() => setImageAlignment('center')}
					>
						<FaAlignCenter className="h-4 w-4" />
					</button>
					<button
						type="button"
						className={`px-2 py-1 border rounded ${
							selectedImageAlignment === 'right'
								? 'bg-blue-200'
								: 'hover:bg-gray-200'
						} text-black`}
						onClick={() => setImageAlignment('right')}
					>
						<FaAlignRight className="h-4 w-4" />
					</button>
				</div>
			)}
			<div className="flex space-x-1 border-r pr-2">
				<button
					className="bg-blue-500 text-white px-3 py-1 rounded mb-3"
					onClick={() => {
						editor.update(() => {
							const flexRow = $createFlexRowNode();
							const selection = $getSelection();
							if (selection !== null) {
								$insertNodes([flexRow]);
							} else {
								const root = $getRoot();
								root.append(flexRow); // Ensure it is placed at the root level
							}
						});
					}}
				>
					Insert Flex Row Block
				</button>
			</div>

			<ImageManager<T, R>
				open={imageManagerOpen}
				apiHost={apiHost}
				onClose={() => setImageManagerOpen(false)}
				handleGetImages={handleGetImages}
				handleUploadImage={handleUploadImage}
				onSelect={handleInsertImageFromManager}
			/>
		</div>
	);
}
