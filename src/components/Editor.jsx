import React, { useEffect, useState } from "react";
import ExampleTheme from "../themes/ExampleTheme";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import ToolbarPlugin from "../plugins/ToolbarPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { ImageNode } from "../nodes/ImageNode";
import ListMaxIndentLevelPlugin from "../plugins/ListMaxLndentLevelPlugin";
import CodeHighlightPlugin from "../plugins/CodeHighlightPlugin";
import AutoLinkPlugin from "../plugins/AutolinkPlugin";
import ToolbarDown from "../plugins/ToolbarDown";
import "../Styles/styles.css";
import { blogByIdAPI } from "../server/allAPI";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Link } from 'react-router-dom'
import { Button } from "bootstrap";


// Placeholder component for editor
function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

// Editor configuration
const editorConfig = {
  theme: ExampleTheme,
  onError(error) {
    throw error;
  },
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
    ImageNode,
  ],
};

// LoadSavedContentPlugin - loads content JSON into editor
function LoadSavedContentPlugin({ content }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!content) {
      return;
    }

    try {
      const parsedState =
        typeof content === "string"
          ? editor.parseEditorState(JSON.parse(content))
          : editor.parseEditorState(content);

      // Defer the editor state update to avoid React flushSync warning
      Promise.resolve().then(() => {
        editor.setEditorState(parsedState);
      });
    } catch (err) {
      console.error("Failed to parse editor state:", err);
    }
  }, [editor, content]);

  return null;
}

// Main Editor component
export default function Editor({ id }) {
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    if (!id) return;

    async function fetchBlog() {
      try {
        const response = await blogByIdAPI(id);
        if (response && response.data) {
          setInitialData(response.data);
        } else {
          console.error("No data returned for blog id", id);
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
      }
    }

    fetchBlog();
  }, [id]);

  return (
    <LexicalComposer initialConfig={editorConfig}>
     
    <div className="container-fluid">
       <div className="row align-items-start g-0 " >
          <div className="col-auto p-3 bg-light border-end">
               <Link to={'/'} className='text-dark fw-bold' style={{textDecoration:'none'}} >
                    <i className="fa-solid fa-house-chimney fs-4"> </i>
                    </Link>
          </div>
          
            
          <div className="editor-container col-11">
            <ToolbarPlugin />
            <div className="editor-inner">
              <RichTextPlugin
                contentEditable={<ContentEditable className="editor-input" />}
                placeholder={<Placeholder />}
                ErrorBoundary={LexicalErrorBoundary}
              />
              <HistoryPlugin />
              <AutoFocusPlugin />
              <CodeHighlightPlugin />
              <ListPlugin />
              <LinkPlugin />
              <AutoLinkPlugin />
              <ListMaxIndentLevelPlugin maxDepth={7} />
              <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
    
              {/* Load content JSON into editor */}
              <LoadSavedContentPlugin content={initialData?.content} />
            </div>
    
            {/* Pass full blog data to ToolbarDown for modal editing */}
            <ToolbarDown id={id} initialData={initialData} />
          </div>
       </div>
    </div>
    </LexicalComposer>
  );
}
