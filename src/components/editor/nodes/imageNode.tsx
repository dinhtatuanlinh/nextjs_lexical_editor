import type { DOMConversionMap, DOMExportOutput } from 'lexical';
import { DecoratorNode, NodeKey, SerializedLexicalNode, Spread } from 'lexical';
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isNodeSelection } from "lexical";
import { useContext, useEffect, useState, type JSX } from 'react';
import { ImageNodeClickContext } from '../lexicalEditor';

export type SerializedImageNode = Spread<
    {
        src: string;
        altText: string;
        width?: number | null;
        height?: number | null;
        maxWidth?: number;
        showCaption?: boolean;
        caption?: string;
        alignment?: 'left' | 'center' | 'right';
        type: 'image';
        version: 1;
    },
    SerializedLexicalNode
>;

function ImageNodeComponent({ src, altText, alignment, nodeKey }: {
	src: string;
	altText: string;
	alignment: 'left' | 'center' | 'right';
	nodeKey: string;
  }) {
	const [editor] = useLexicalComposerContext();
	const [isSelected, setIsSelected] = useState(false);
	const imageNodeClickCtx = useContext(ImageNodeClickContext);
  
	useEffect(() => {
	  return editor.registerUpdateListener(({ editorState }) => {
		editorState.read(() => {
		  const selection = $getSelection();
		  const selected = $isNodeSelection(selection) && selection.has(nodeKey);
		  setIsSelected(selected);
		});
	  });
	}, [editor, nodeKey]);
  
	const handleClick = (e: React.MouseEvent) => {
	  e.preventDefault();
	  if (imageNodeClickCtx) imageNodeClickCtx.setLastClickedImageKey(nodeKey);
	  // @ts-expect-error - The 'node-select' command is not recognized by TypeScript but is handled by the editor.
	  editor.dispatchCommand('node-select', nodeKey);
	  // Fallback: use DOM range selection
	  const domElem = editor.getElementByKey(nodeKey);
	  const selection = window.getSelection();
	  if (domElem && selection) {
		const range = document.createRange();
		range.selectNode(domElem);
		selection.removeAllRanges();
		selection.addRange(range);
	  }
	};
  
	const alignmentStyle: React.CSSProperties = {
	  maxWidth: "100%",
	  display: "block",
	  margin: "8px 0",
	  marginLeft: alignment === "center" ? "auto" : alignment === "right" ? "auto" : "0",
	  marginRight: alignment === "center" ? "auto" : alignment === "right" ? "0" : "auto",
	  textAlign: alignment,
	  border: isSelected ? "2px solid #2563eb" : "2px solid transparent",
	  boxSizing: "border-box",
	};
  
	return (
	  <span onClick={handleClick} style={{ display: "inline-block", width: "100%" }}>
		{/* eslint-disable-next-line @next/next/no-img-element */}
		<img
		  src={src}
		  alt={altText}
		  width={640}
		  height={360}
		  style={alignmentStyle}
		  draggable={false}
		/>
	  </span>
	);
  } 

export class ImageNode extends DecoratorNode<JSX.Element> {
    __src: string;
    __altText: string;
    __alignment: 'left' | 'center' | 'right';

    static getType(): string {
        return 'image';
    }

    static clone(node: ImageNode): ImageNode {
        return new ImageNode(
            node.__src,
            node.__altText,
            node.__alignment,
            node.__key
        );
    }

    constructor(
        src: string,
        altText: string,
        alignment: 'left' | 'center' | 'right' = 'left',
        key?: NodeKey
    ) {
        super(key);
        this.__src = src;
        this.__altText = altText;
        this.__alignment = alignment;
    }

    createDOM(): HTMLElement {
        const div = document.createElement('div');
        div.className = 'editor-image';
        return div;
    }

    updateDOM(): false {
        return false;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('img');
        element.setAttribute('src', this.__src);
        element.setAttribute('alt', this.__altText);
        element.setAttribute('class', 'editor-image');
        element.style.maxWidth = '100%';
        element.style.height = 'auto';
        element.style.display = 'block';
        element.style.margin = '8px 0';

        // Create wrapper paragraph for alignment
        const wrapper = document.createElement('p');
        wrapper.className = 'editor-paragraph';
        
        // Apply alignment styles to wrapper
        switch (this.__alignment) {
            case 'center':
                wrapper.style.textAlign = 'center';
                element.style.margin = '8px auto';
                break;
            case 'right':
                wrapper.style.textAlign = 'right';
                element.style.marginLeft = 'auto';
                break;
            case 'left':
                wrapper.style.textAlign = 'left';
                element.style.marginRight = 'auto';
                break;
        }

        wrapper.appendChild(element);
        return { element: wrapper };
    }

    static importJSON(serializedNode: SerializedImageNode): ImageNode {
        const { src, altText, alignment } = serializedNode;
        return new ImageNode(src, altText, alignment || 'left');
    }

    exportJSON(): SerializedImageNode {
        return {
            type: 'image',
            version: 1,
            src: this.__src,
            altText: this.__altText,
            alignment: this.__alignment,
        };
    }

    getTextContent(): string {
        return `![${this.__altText}](${this.__src})`;
    }

    decorate(): JSX.Element {
        return (
            <ImageNodeComponent
                key={this.__key}
                src={this.__src}
                altText={this.__altText}
                alignment={this.__alignment}
                nodeKey={this.getKey()}
            />
        );
    }

    static importDOM(): DOMConversionMap {
        return {
            img: (node: HTMLElement) => {
                if (!(node instanceof HTMLImageElement)) {
                    return null;
                }

                // Get basic attributes
                const src = node.getAttribute('src');
                if (!src) {
                    return null;
                }

                // Get alt text
                const altText = node.getAttribute('alt') || '';

                // Determine alignment from style or class
                let alignment: 'left' | 'center' | 'right' = 'left';
                if (node.style.textAlign) {
                    alignment = node.style.textAlign as 'left' | 'center' | 'right';
                } else if (node.classList.contains('align-left')) {
                    alignment = 'left';
                } else if (node.classList.contains('align-center')) {
                    alignment = 'center';
                } else if (node.classList.contains('align-right')) {
                    alignment = 'right';
                }

                return {
                    conversion: () => ({
                        node: new ImageNode(src, altText, alignment)
                    }),
                    priority: 1,
                };
            },
        };
    }

    isInline(): boolean {
        return false;
    }

    isIsolated(): boolean {
        return true;
    }
}

export function $createImageNode({
    src,
    altText,
    alignment = 'left',
}: {
    src: string;
    altText?: string;
    alignment?: 'left' | 'center' | 'right';
}): ImageNode {
    return new ImageNode(src, altText || '', alignment);
}
