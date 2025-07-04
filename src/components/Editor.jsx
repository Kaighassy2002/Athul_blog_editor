import React, { useEffect, useState } from "react";
import ExampleTheme from "../themes/ExampleTheme";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import ToolbarPlugin from "../plugins/ToolbarPlugin";
import {
  HeadingNode,
  QuoteNode
} from "@lexical/rich-text";
import {
  TableCellNode,
  TableNode,
  TableRowNode
} from "@lexical/table";
import {
  ListItemNode,
  ListNode
} from "@lexical/list";
import {
  CodeHighlightNode,
  CodeNode
} from "@lexical/code";
import {
  AutoLinkNode,
  LinkNode
} from "@lexical/link";
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
import {
  blogByIdAPI,
  scribbleByIdAPI
} from "../server/allAPI";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  Link,
  useNavigate,
  useParams
} from "react-router-dom";
import LocalStoragePlugin from "../plugins/LocalStoragePlugin";

// Placeholder
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

// Plugin to load saved JSON content into the editor
const STORAGE_KEY = "unsaved-editor-content";
function LoadSavedContentPlugin({ content }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    let toLoad = content;

    if (!toLoad) {
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        console.warn("⚠️ Using unsaved local content from localStorage");
        toLoad = local;
      }
    }

    if (!toLoad || typeof toLoad !== "object" || !toLoad.root) {
      console.warn("⚠️ No valid editor content to load.");
      return;
    }

    try {
      const parsedContent =
        typeof toLoad === "string" ? JSON.parse(toLoad) : toLoad;
      const parsedState = editor.parseEditorState(parsedContent);
      Promise.resolve().then(() => {
        editor.setEditorState(parsedState);
      });
    } catch (err) {
      console.error("❌ Failed to parse editor state:", err);
    }
  }, [editor, content]);

  return null;
}

// Main Editor component
export default function Editor() {
  const { type, id, slug } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    if (!id || !type) return;

    const fetchFn = type === "scribble" ? scribbleByIdAPI : blogByIdAPI;

    fetchFn(id)
      .then((response) => {
        const data = response?.data?.data || response?.data;
        console.log("Fetched Response:", data);

        if (data) {
          setInitialData(data);
          console.log("Content received:", data.content);

          if (data.slug && data.slug !== slug) {
            navigate(`/editor/${type}/${data.slug}/${id}`, {
              replace: true,
            });
          }
        } else {
          console.error(`No data found for ${type} with id ${id}`);
        }
      })
      .catch((error) => {
        console.error(`Error fetching ${type}:`, error);
      });
  }, [id, type, slug, navigate]);

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="container-fluid">
        <div className="row align-items-start g-0">
          <div className="col-auto p-3 bg-light border-end">
            <Link
              to={"/"}
              className="text-dark fw-bold"
              style={{ textDecoration: "none" }}
            >
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
              <LocalStoragePlugin />

           <LoadSavedContentPlugin content={initialData?.content} />
            </div>

            <ToolbarDown id={id} initialData={initialData} />
          </div>
        </div>
      </div>
    </LexicalComposer>
  );
}
