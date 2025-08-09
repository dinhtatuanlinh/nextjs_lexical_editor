'use client';
import { ParagraphNode } from 'lexical';
import { createContext, memo, useImperativeHandle, useMemo, useState } from 'react';

import { LinkNode } from '@lexical/link';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode } from '@lexical/rich-text';
import { OnChangePlugin } from './plugins/onChangePlugin';
import ToolbarPlugin from './plugins/toolbar';
import theme from './theme';
import { ImageNode } from './nodes/imageNode';
import ImagePlugin from './plugins/imagePlugin';
import { FlexRowNode } from './nodes/flexRowNode';
import FloatingTextFormatToolbarPlugin from './plugins/floatingMenuPlugin';
import { StyledBlockNode } from './nodes/styledBlockNode';
import './editor.css';
import StyledBlockPlugin from './plugins/styleBlockPlugin';
import { StyledBlockBehaviourPlugin } from './plugins/styledBlockBehaviourPlugin';
import { LexicalEditor as LexicalEditorInstance } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import EditorRefPlugin from './plugins/EditorRefPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { ListNode, ListItemNode } from '@lexical/list';
import PrintJSONPlugin from './plugins/PrintJSONPlugin';

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: any) {
	console.error(error);
}

// Context to provide image click handler and last clicked image key
export const ImageNodeClickContext = createContext<{
	lastClickedImageKey: string | null;
	setLastClickedImageKey: (key: string | null) => void;
} | null>(null);

interface LexicalProps<
	T extends { imageId: number; name: string; link: string; type: string },
	R extends { images: T[]; totalPages: number }
> {
	apiHost: string;
	onChange: (content: string) => void;
	handleGetImages: (pageNumber: number) => Promise<R>;
	handleUploadImage: (file: File, fileName: string) => Promise<void>;
	initialContent?: string;
}

function LexicalEditor<
	T extends { imageId: number; name: string; link: string; type: string },
	R extends { images: T[]; totalPages: number }
>({
	apiHost,
	onChange,
	handleGetImages,
	handleUploadImage,
	ref,
	initialContent,
}: LexicalProps<T, R> & { ref: React.Ref<LexicalEditorInstance | null> }) {
	const [lastClickedImageKey, setLastClickedImageKey] = useState< string | null >(null);
	const initialConfig = {
		namespace: 'MyEditor',
		theme: theme,
		onError: (e: any) => {
			console.log('ERROR:', e);
		},
		nodes: [HeadingNode, ParagraphNode, LinkNode, ImageNode, FlexRowNode, StyledBlockNode, ListNode, ListItemNode],
		editorState: initialContent,
	};

	const CustomPlaceholder = useMemo(() => {
		return (
			<div
				style={{
					position: 'absolute',
					top: 70,
					left: 20,
				}}
			>
				Enter some text...
			</div>
		);
	}, []);

	const handleEditorChange = (content: string) => {
		onChange(content);
	};


	return (
		<div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-4 h-[50vh] relative">
			<ImageNodeClickContext.Provider
				value={{ lastClickedImageKey, setLastClickedImageKey }}
			>
				<LexicalComposer initialConfig={initialConfig}>
					<ToolbarPlugin
						handleGetImages={handleGetImages}
						handleUploadImage={handleUploadImage}
						apiHost={apiHost}
					/>
					<RichTextPlugin
						contentEditable={
							<ContentEditable
								className="focus:outline-none"
								aria-placeholder={'Enter some text...'}
								placeholder={CustomPlaceholder}
							/>
						}
						ErrorBoundary={LexicalErrorBoundary}
					/>
					<HistoryPlugin />
					<OnChangePlugin onChange={handleEditorChange} />
					<LinkPlugin />
					<ListPlugin />
					<ImagePlugin />
					<AutoFocusPlugin />
					<FloatingTextFormatToolbarPlugin />
					<StyledBlockPlugin />
					<StyledBlockBehaviourPlugin />
					<EditorRefPlugin refObject={ref} />
					{/* <PrintJSONPlugin /> */}
				</LexicalComposer>
			</ImageNodeClickContext.Provider>
		</div>
	);
}
export default memo(LexicalEditor) as typeof LexicalEditor;
