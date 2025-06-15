import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Button, Modal, Form, Spinner } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveEditorAPI, updatesByIdAPI } from "../server/allAPI";
import { $generateHtmlFromNodes } from "@lexical/html";

export default function ToolbarDown({ id = null, initialData = null }) {
  const [editor] = useLexicalComposerContext();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [tags, setTags] = useState("");
  const [contentJSON, setContentJSON] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [type, setType] = useState("");

  const isEditMode = Boolean(id);

  // Sync modal fields when opened in edit mode
  useEffect(() => {
    if (showModal && isEditMode && initialData) {
      setTitle(initialData.title || "");
      setCoverImageUrl(initialData.coverImageUrl || "");
      setTags((initialData.tags || []).join(", "));
    }
  }, [showModal, isEditMode, initialData]);

 const handleSaveClick = () => {
  const editorState = editor.getEditorState();

  editorState.read(() => {
    const root = editorState._nodeMap.get("root");
    const plainText = root?.getTextContent()?.trim() || "";

    if (!plainText) {
      alert("Editor is empty. Nothing to save.");
      return;
    }

    const content = editorState.toJSON();
    setContentJSON(content);
    setShowModal(true);
  });
};

  const handleModalSave = async () => {
    if (title.trim() === "") {
      alert("Please enter a title.");
      return;
    }

    const payload = {
      title,
      coverImageUrl,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
        type,
      content: contentJSON,
    };

    try {
      setIsSaving(true);
      let res;
      if (isEditMode) {
        res = await updatesByIdAPI(id, payload);
      } else {
        res = await saveEditorAPI(payload);
      }

      if (res) {
        alert(isEditMode ? "Successfully updated!" : "Successfully saved!");
        setShowModal(false);
        setTitle("");
        setCoverImageUrl("");
        setTags("");
        setContentJSON(null);
        localStorage.removeItem("unsaved-editor-content");
      } else {
        alert(isEditMode ? "Failed to update content." : "Failed to save content.");
      }
    } catch (err) {
      console.error("Error saving/updating content:", err);
      alert(`Error ${isEditMode ? "updating" : "saving"} content.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    const editorState = editor.getEditorState();
    editorState.read(() => {
      const html = $generateHtmlFromNodes(editor, null); // ✅ correct usage
      navigate("/preview", { state: { content: html } });
    });
  };

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: "0",
          right: "0",
          padding: "10px",
          display: "flex",
          gap: "10px",
        }}
        className="toolbar"
      >
        <Button className="btn btn-primary btn-sm" onClick={handleSaveClick}>
          {isEditMode ? "Update" : "Save"}
        </Button>
        <Button className="btn btn-secondary btn-sm" onClick={handlePreview}>
          Preview
        </Button>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? "Update" : "Save"} Content Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formCoverImage">
              <Form.Label>Cover Image URL</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter cover image URL"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formTags">
              <Form.Label>Tags (#tag)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter tags separated by commas"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <Form.Text className="text-muted">
                Separate tags with commas (e.g. react, lexical, editor)
              </Form.Text>
            </Form.Group>
          </Form>
          <Form.Group className="mb-3" controlId="formType">
      <Form.Label>Type</Form.Label>
      <Form.Select
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="">Select type</option>
        <option value="blog">Blog</option>
        <option value="scribble">Scribble</option>
      </Form.Select>
    </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleModalSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Spinner animation="border" size="sm" /> Saving...
              </>
            ) : (
              isEditMode ? "Update Content" : "Save Content"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
