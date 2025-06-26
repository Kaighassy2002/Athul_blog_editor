import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

function LoadSavedContentPlugin({ content }) {
  const [editor] = useLexicalComposerContext();
  const STORAGE_KEY = "unsaved-editor-content";

  useEffect(() => {
    const loadContent = () => {
      let editorState;

      try {
        if (content) {
          // 🟢 Priority 1: content from props (e.g., DB)
          editorState = editor.parseEditorState(content);
        } else {
          // 🟡 Priority 2: check localStorage (unsaved draft)
          const saved = localStorage.getItem(STORAGE_KEY);
          if (!saved) return;

          const parsed = JSON.parse(saved);
          editorState = editor.parseEditorState(parsed);
        }

        // ✅ Schedule the state update
        queueMicrotask(() => {
          editor.setEditorState(editorState);
        });

      } catch (err) {
        console.error("❌ Failed to load editor state:", err);
      }
    };

    loadContent();
  }, [editor, content]);

  return null;
}

export default LoadSavedContentPlugin;
