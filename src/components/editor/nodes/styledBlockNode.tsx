// nodes/StyledBlockNode.ts
import {
	$applyNodeReplacement,
	$createParagraphNode,
	DOMConversionMap,
	DOMExportOutput,
	ElementNode,
	SerializedElementNode,
} from 'lexical';

export type SerializedStyledBlockNode = SerializedElementNode & {
	type: 'styled-block';
	version: 1;
	className?: string; // optional custom class
	style?: Record<string, string>; // or inline style
};

export class StyledBlockNode extends ElementNode {
	__className?: string;
	__customStyle?: Record<string, string>;

	static getType() {
		return 'styled-block';
	}

	static clone(node: StyledBlockNode) {
		return new StyledBlockNode(
			node.__className,
			node.__customStyle,
			node.__key
		);
	}

	constructor(
		className?: string,
		style?: Record<string, string>,
		key?: string
	) {
		super(key);
		this.__className = className;
		this.__customStyle = style;
	}

	// ---------- DOM ↔️ Lexical ----------
	createDOM(): HTMLElement {
		const dom = document.createElement('div');
		if (this.__className) dom.className = this.__className;
		if (this.__customStyle) Object.assign(dom.style, this.__customStyle);
		return dom;
	}

	updateDOM(prevNode: StyledBlockNode, dom: HTMLElement): boolean {
		if (this.__className !== prevNode.__className) {
			dom.className = this.__className ?? '';
		}
		if (this.__customStyle !== prevNode.__customStyle) {
			dom.removeAttribute('style');
			if (this.__customStyle)
				Object.assign(dom.style, this.__customStyle);
		}
		return false; // children didn’t affect this element
	}

	static importDOM(): DOMConversionMap | null {
		return {
			div: () => ({
				conversion: (elem) => {
					// Convert CSSStyleDeclaration to Record<string, string>
					const styleObj: Record<string, string> = {};
					for (let i = 0; i < elem.style.length; i++) {
						const property = elem.style[i];
						styleObj[property] =
							elem.style.getPropertyValue(property);
					}
					return {
						node: new StyledBlockNode(elem.className, styleObj),
					};
				},
				priority: 1,
			}),
		};
	}

	exportDOM(): DOMExportOutput {
		const elem = document.createElement('div');
		if (this.__className) elem.className = this.__className;
		if (this.__customStyle) Object.assign(elem.style, this.__customStyle);
		return { element: elem };
	}

	// ---------- Serialization ----------
	static importJSON(json: SerializedStyledBlockNode) {
		return $applyNodeReplacement(
			new StyledBlockNode(json.className, json.style)
		);
	}

	exportJSON(): SerializedStyledBlockNode {
		return {
			...super.exportJSON(),
			type: 'styled-block',
			version: 1,
			className: this.__className,
			style: this.__customStyle || undefined,
		};
	}
}
/** Creates a StyledBlockNode that already contains one empty paragraph */
export function $createStyledBlockNodeWithParagraph(
	className: string = '',
	style: Record<string, string> = {}
): StyledBlockNode {
	const block = new StyledBlockNode(className, style);
	const p = $createParagraphNode();
	block.append(p);
	return $applyNodeReplacement(block);
}

export function $isStyledBlockNode(node: unknown): node is StyledBlockNode {
	return node instanceof StyledBlockNode;
}
