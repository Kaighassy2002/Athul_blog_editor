import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Button, Modal, Form, Spinner } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  characterAPI,
  saveEditorBlogAPI,
  saveEditorScribbleAPI,
  teachStackAPI,
  updatesBlogByIdAPI,
  updatesScribbleByIdAPI,
} from "../server/allAPI";
import { $generateHtmlFromNodes } from "@lexical/html";

export default function ToolbarDown({ id = null, initialData = null }) {
  const [editor] = useLexicalComposerContext();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [tech_stack, setTechStack] = useState("");
  const [character, setCharacter] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [characterList, setCharacterList] = useState([]);
  const [techStackList, setTeackStackList] = useState([]);
  const [contentJSON, setContentJSON] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = Boolean(id);

  const generateSlug = (title) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  useEffect(() => {
    if (showModal && isEditMode && initialData) {
      setTitle(initialData.title || "");
      setTags((initialData.tags || []).join(", "));
      setCoverImageUrl(initialData.coverImageUrl || "");
      setTechStack((initialData.tech_stack || []).join(", "));
      setCharacter(initialData.character || "");
      setCategory(initialData.category || "");
      setType(initialData.type || "");
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

  useEffect(() => {
    if (type === "scribble") {
      characterAPI()
        .then((res) => {
          setCharacterList(res.data);
        })
        .catch((err) => {
          console.error("Character API error:", err);
        });
    }
  }, [type]);

  useEffect(() => {
    if (type === "blog") {
      teachStackAPI()
        .then((res) => {
          setTeackStackList(res.data);
        })
        .catch((err) => {
          console.error("Teach Stack API error:", err);
        });
    }
  }, [type]);

  const handleModalSave = async () => {
    if (!type) {
      alert("Please select a type (Blog or Scribble).");
      return;
    }
    if (title.trim() === "") {
      alert("Please enter a title.");
      return;
    }

    const slug = generateSlug(title);
    const basePayload = {
      title,
      slug,
      content: contentJSON,
      type,
    };

    const blogPayload = {
      ...basePayload,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      tech_stack: tech_stack.split(",").map((id) => id.trim()),
      coverImageUrl,
    };

    const scribblePayload = {
      ...basePayload,
      character: character.trim(),
      category: category.trim(),
    };

    try {
      setIsSaving(true);

      let res;
      if (isEditMode) {
        res =
          type === "blog"
            ? await updatesBlogByIdAPI(id, blogPayload)
            : await updatesScribbleByIdAPI(id, scribblePayload);
      } else {
        res =
          type === "blog"
            ? await saveEditorBlogAPI(blogPayload)
            : await saveEditorScribbleAPI(scribblePayload);
      }

      if (res?.status === 200 || res?.status === 201) {
        alert(isEditMode ? "Successfully updated!" : "Successfully saved!");
        resetModalFields();
      } else {
        alert("Failed to save content. Status: " + res?.status);
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Error occurred while saving content.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetModalFields = () => {
    setShowModal(false);
    setTitle("");
    setTags("");
    setCoverImageUrl("");
    setTechStack("");
    setCharacter("");
    setCategory("");
    setType("");
    setContentJSON(null);
    localStorage.removeItem("unsaved-editor-content");
  };

  const handlePreview = () => {
    const editorState = editor.getEditorState();
    editorState.read(() => {
      const html = $generateHtmlFromNodes(editor, null);
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

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? "Update" : "Save"} Content</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
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

            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Form.Group>

            {type === "blog" && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Tags (comma separated)</Form.Label>
                  <Form.Control
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Tech Stack</Form.Label>
                  <Form.Select
                    value={tech_stack}
                    onChange={(e) => setTechStack(e.target.value)}
                  >
                    <option value="">Select a Tech Stack</option>
                    {techStackList.map((tech) => (
                      <option key={tech._id} value={tech._id}>
                        {tech.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Cover Image URL</Form.Label>
                  <Form.Control
                    type="text"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                  />
                </Form.Group>
              </>
            )}

            {type === "scribble" && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Character</Form.Label>
                  <Form.Select
                    value={character}
                    onChange={(e) => setCharacter(e.target.value)}
                  >
                    <option value="">Select a character</option>
                    {characterList.map((char) => (
                      <option key={char._id} value={char._id}>
                        {char.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </Form.Group>
              </>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleModalSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Spinner animation="border" size="sm" /> Saving...
              </>
            ) : isEditMode ? (
              "Update Content"
            ) : (
              "Save Content"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
