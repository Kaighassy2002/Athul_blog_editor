import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

function LoadSavedContentPlugin() {
  const [editor] = useLexicalComposerContext();
  const STORAGE_KEY = "unsaved-editor-content";

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      const editorState = editor.parseEditorState(parsed);
      editor.setEditorState(editorState);
    } catch (err) {
      console.error("❌ Failed to load saved editor state:", err);
    }
  }, [editor]);

  return null;
}

export default LoadSavedContentPlugin;
