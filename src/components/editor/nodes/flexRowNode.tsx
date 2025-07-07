import {
	DecoratorNode,
	LexicalEditor,
	NodeKey,
	SerializedLexicalNode,
	Spread,
	createEditor,
} from 'lexical';
import * as React from 'react';
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';

type SerializedFlexRowNode = Spread<
	{
		type: 'flex-row';
		version: 1;
	},
	SerializedLexicalNode
>;

function PanelEditor({ editor }: { editor: LexicalEditor }) {
	return (
		<LexicalNestedComposer initialEditor={editor}>
			<RichTextPlugin
				contentEditable={
					<ContentEditable className="min-h-[80px] p-2 border rounded" />
				}
				placeholder={
					<div className="text-gray-400">Edit content...</div>
				}
				ErrorBoundary={() => <div>Error rendering editor</div>}
			/>
			<HistoryPlugin />
		</LexicalNestedComposer>
	);
}

function FlexRowComponent(): React.JSX.Element {
	const leftEditor = React.useMemo(() => createEditor(), []);
	const rightEditor = React.useMemo(() => createEditor(), []);

	return (
		<div className="flex justify-between items-center gap-4 my-4">
			<div className="w-1/2">
				<PanelEditor editor={leftEditor} />
			</div>
			<div className="w-1/2">
				<PanelEditor editor={rightEditor} />
			</div>
		</div>
	);
}

export class FlexRowNode extends DecoratorNode<React.JSX.Element> {
	static getType(): string {
		return 'flex-row';
	}

	static clone(node: FlexRowNode): FlexRowNode {
		return new FlexRowNode(node.__key);
	}

	constructor(key?: NodeKey) {
		super(key);
	}

	decorate(): React.JSX.Element {
		console.log("Decorating node:", this.getKey());
		return <FlexRowComponent />;
	}

	createDOM(): HTMLElement {
		const div = document.createElement('div');
		return div;
	  }

	// ⚠ No createDOM() needed here!

	exportJSON(): SerializedFlexRowNode {
		return {
		  type: 'flex-row',
		  version: 1,
		};
	}
	static importJSON(): FlexRowNode {
		return new FlexRowNode();
	}

	isInline(): boolean {
		return false;
	}
}

export function $createFlexRowNode(): FlexRowNode {
	return new FlexRowNode();
}
