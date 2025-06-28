import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Button, Form, Spinner } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  characterAPI,
  saveEditorBlogAPI,
  saveEditorScribbleAPI,
  teachStackAPI,
  toggleBlogPublishAPI,
  toggleScribblePublishAPI,
  updatesBlogByIdAPI,
  updatesScribbleByIdAPI,
} from "../server/allAPI";
import { $generateHtmlFromNodes } from "@lexical/html";
import "../Styles/toolbar.css";

export default function ToolbarDown({ id: propId = null, initialData = null }) {
  const [editor] = useLexicalComposerContext();
  const navigate = useNavigate();

  const [id, setId] = useState(propId);
  const [showSidebar, setShowSidebar] = useState(false);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [tech_stack, setTechStack] = useState("");
  const [character, setCharacter] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [characterList, setCharacterList] = useState([]);
  const [techStackList, setTechStackList] = useState([]);
  const [contentJSON, setContentJSON] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode && initialData) {
      setType(initialData.type || "");
      setIsPublished(initialData.is_published || false);
    }
  }, [isEditMode, initialData]);

  useEffect(() => {
    if (showSidebar && isEditMode && initialData) {
      setTitle(initialData.title || "");
      setTags((initialData.tags || []).join(", "));
      setCoverImageUrl(initialData.coverImageUrl || "");
      setTechStack((initialData.tech_stack || []).join(", "));
      setCharacter(initialData.character || "");
      setCategory(initialData.category || "");
      setIsSaved(true);
    }
  }, [showSidebar, isEditMode, initialData]);

  const generateSlug = (title) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

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
      setShowSidebar(true);
    });
  };

  useEffect(() => {
    if (type === "scribble") {
      characterAPI()
        .then((res) => setCharacterList(res.data))
        .catch((err) => console.error("Character API error:", err));
    } else if (type === "blog") {
      teachStackAPI()
        .then((res) => setTechStackList(res.data))
        .catch((err) => console.error("Tech Stack API error:", err));
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
      ...(isEditMode && { is_published: isPublished }), // keep publish state only in edit
    };

    const blogPayload = {
      ...basePayload,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      tech_stack: tech_stack.split(",").map((id) => id.trim()),
      coverImageUrl,
    };

    const scribblePayload = {
      ...basePayload,
      ...(character.trim() && { character }),
      ...(category.trim() && { category }),
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
        setIsSaved(true);

        if (!isEditMode) {
          setIsPublished(false); 
          const newId =
            res?.data?._id ||
            res?.data?.blog?._id ||
            res?.data?.scribble?._id;

          if (newId) {
            setId(newId);
            window.history.replaceState(null, "", `/editor/${newId}`);
          }
        }

        resetSidebarFields();
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

  const resetSidebarFields = () => {
    setShowSidebar(false);
    setTitle("");
    setTags("");
    setCoverImageUrl("");
    setTechStack("");
    setCharacter("");
    setCategory("");
    setContentJSON(null);
    localStorage.removeItem("unsaved-editor-content");
  };

  const handlePreview = () => {
    editor.update(() => {
      const html = $generateHtmlFromNodes(editor);
      const json = editor.getEditorState().toJSON();
      localStorage.setItem("editor-html-preview", html);
      localStorage.setItem("unsaved-editor-content", JSON.stringify(json));
    });

    navigate("/preview");
  };

  const handlePublishClick = async () => {
    if (!isSaved && !isEditMode) {
      setShowSidebar(true);
      alert("Please save your content before publishing.");
      return;
    }

    if (!type || !id) {
      alert("Missing content type or ID for publishing.");
      return;
    }

    const newPublishState = !isPublished;
    const confirmMsg = newPublishState
      ? "Are you sure you want to publish this content?"
      : "Are you sure you want to unpublish this content?";

    const confirmAction = window.confirm(confirmMsg);
    if (!confirmAction) return;

    try {
      const res =
        type === "blog"
          ? await toggleBlogPublishAPI(id, newPublishState)
          : await toggleScribblePublishAPI(id, newPublishState);

      if (res?.status === 200) {
        setIsPublished(newPublishState);
        alert(
          newPublishState
            ? "Content has been published successfully!"
            : "Content has been unpublished."
        );
      } else {
        alert("Failed to update publish status.");
      }
    } catch (err) {
      console.error("Publish toggle error:", err);
      alert("Something went wrong while updating publish status.");
    }
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
      >
        <Button className="btn btn-primary btn-sm" onClick={handleSaveClick}>
          {isEditMode ? "Update" : "Save"}
        </Button>
        <Button className="btn btn-secondary btn-sm" onClick={handlePreview}>
          Preview
        </Button>
        <Button
  className={`btn btn-sm d-flex align-items-center gap-2 ${isPublished ? "btn-danger" : "btn-success"}`}
  onClick={handlePublishClick}
  disabled={isSaving}
>
  <i className={`fa-solid ${isPublished ? "fa-circle-exclamation" : "fa-circle-check"}`}></i>
  {isPublished ? "Unpublish" : "Publish"}
</Button>

      </div>

      {showSidebar && (
        <>
          <div className="sidebar-overlay" onClick={resetSidebarFields}></div>
          <div className="sidebar">
            <h5>{isEditMode ? "Update" : "Save"} Content</h5>
            <hr />
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

            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button
                variant="secondary"
                onClick={resetSidebarFields}
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
            </div>
          </div>
        </>
      )}
    </>
  );
}
