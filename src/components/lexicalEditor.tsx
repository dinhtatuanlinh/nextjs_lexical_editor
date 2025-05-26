"use client";

import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, ListItemNode, ListNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { $createHeadingNode, HeadingNode, HeadingTagType } from "@lexical/rich-text";
import { $setBlocksType } from '@lexical/selection';
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
} from "lexical";
import { forwardRef, useImperativeHandle } from 'react';
import { FaAlignCenter, FaAlignLeft, FaAlignRight } from "react-icons/fa";



const theme = {
  paragraph: "editor-paragraph",
  text: {
    base: "editor-text",
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    color: "editor-text-color",
  },
  list: {
    ul: "list-disc pl-6",
    ol: "list-decimal pl-6",
    listitem: "ml-2",
  },
  heading: {
    h1: "text-2xl font-bold",
    h2: "text-xl font-bold",
    h3: "text-lg font-bold",
  },
};

function onChange(editorState: any) {
  editorState.read(() => {
    const selection = $getSelection();
    const editorContent = editorState._nodeMap;
  });
}

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const color = e.target.value;
        const textNode = $createTextNode(selection.getTextContent());
        textNode.setStyle(`color: ${color}`);
        selection.insertNodes([textNode]);
      }
    });
  };

  const handleHeadingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const heading = e.target.value;

    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(heading as HeadingTagType));
      }
    });
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const fontSize = e.target.value;
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const textNode = $createTextNode(selection.getTextContent());
        textNode.setStyle(`font-size: ${fontSize}`);
        selection.insertNodes([textNode]);
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2 border-b p-2 bg-gray-100">
      <div className="flex space-x-1">
        <button
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
          className="px-2 py-1 border rounded hover:bg-gray-200 text-black font-semibold"
        >
          B
        </button>
        <button
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
          className="px-2 py-1 border rounded hover:bg-gray-200 text-black italic"
        >
          I
        </button>
        <button
          onClick={() =>
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
          }
          className="px-2 py-1 border rounded hover:bg-gray-200 text-black underline"
        >
          U
        </button>
      </div>

      <div className="flex space-x-1">
      <button
          onClick={() => handleHeadingChange({ target: { value: 'h1' } } as any)}
          className="px-2 py-1 border rounded hover:bg-gray-200 text-black"
        >
          H1
        </button>
        <button
          onClick={() => handleHeadingChange({ target: { value: 'paragraph' } } as any)}
          className="px-2 py-1 border rounded hover:bg-gray-200 text-black"
        >
          Normal
        </button>
        <button
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
          className="px-2 py-1 border rounded hover:bg-gray-200 text-black"
        >
          <FaAlignLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() =>
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")
          }
          className="px-2 py-1 border rounded hover:bg-gray-200 text-black"
        >
          <FaAlignCenter className="h-5 w-5" />
        </button>
        <button
          onClick={() =>
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")
          }
          className="px-2 py-1 border rounded hover:bg-gray-200 text-black"
        >
          <FaAlignRight className="h-5 w-5" />
        </button>
      </div>

      <div className="flex space-x-1">
        <button
          onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
          className="px-2 py-1 border rounded hover:bg-gray-200 text-black"
        >
          •
        </button>
        <button
          onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
          className="px-2 py-1 border rounded hover:bg-gray-200 text-black"
        >
          1.
        </button>
      </div>

      <div className="flex items-center space-x-1">
        <label htmlFor="color-picker" className="text-sm text-black">
          Color:
        </label>
        <input
          type="color"
          id="color-picker"
          onChange={handleColorChange}
          className="w-8 h-8 p-0 border rounded cursor-pointer"
        />
      </div>

      <div className="flex items-center space-x-1">
        <label htmlFor="font-size-picker" className="text-sm text-black">
          Font size:
        </label>
        <select
          id="font-size-picker"
          onChange={handleFontSizeChange}
          className="border rounded px-2 py-1 text-black"
          defaultValue="16px"
        >
          <option value="8px">8</option>
          <option value="9px">9</option>
          <option value="10px">10</option>
          <option value="11px">11</option>
          <option value="12px">12</option>
          <option value="13px">13</option>
          <option value="14px">14</option>
          <option value="15px">15</option>
          <option value="16px">16</option>
          <option value="17px">17</option>
          <option value="18px">18</option>
          <option value="19px">19</option>
          <option value="20px">20</option>
          <option value="21px">21</option>
          <option value="22px">22</option>
          <option value="24px">24</option>
        </select>
      </div>

      <div className="flex space-x-1">
        <button
          onClick={() => handleHeadingChange({ target: { value: 'paragraph' } } as any)}
          className="px-2 py-1 border rounded hover:bg-gray-200 text-black"
        >
          Normal
        </button>
      </div>
    </div>
  );
}

function ImperativeContentPlugin(props: any, ref: any) {
  const [editor] = useLexicalComposerContext();
  useImperativeHandle(ref, () => ({
    getContent: () => {
      editor.getEditorState().read(() => {
        const editorContent = editor.getEditorState()._nodeMap;
        console.log("Editor content:", editorContent);
      });
    }
  }), [editor]);
  return null;
}
const ImperativeContentPluginWithRef = forwardRef(ImperativeContentPlugin);

const LexicalEditor = forwardRef((props, ref) => {
  const initialConfig = {
    namespace: "MyEditor",
    theme,
    onError(error: any) {
      throw error;
    },
    nodes: [ListNode, ListItemNode, HeadingNode],
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="border rounded shadow editor-container">
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="p-2 min-h-[200px] outline-none" />
          }
          ErrorBoundary={({ children }) => <>{children}</>}
        />
        <HistoryPlugin />
        <ListPlugin />
        <OnChangePlugin onChange={onChange} />
        <ImperativeContentPluginWithRef ref={ref} />
      </div>
    </LexicalComposer>
  );
});

LexicalEditor.displayName = 'LexicalEditor';

export default LexicalEditor;
