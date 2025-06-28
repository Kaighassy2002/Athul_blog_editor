import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";

export default function PreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
 const content =
  localStorage.getItem("editor-html-preview")?.trim() ||
  "<p style='text-align:center;'>No content to preview.</p>";

 console.log("HTML Content:", content);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        padding: "2rem",
        boxSizing: "border-box",
        backgroundColor: "#f4f4f4",
        overflowY: "auto",
        position: "relative",
      }}
    >
      <Button
        className="mb-3"
        onClick={() => navigate(-1)}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 10,
        }}
        variant="secondary"
      >
        ⬅ Back to Editor
      </Button>

      <div
        style={{
          marginTop: "4rem",
          maxWidth: "900px",
          marginLeft: "auto",
          marginRight: "auto",
          padding: "2rem",
          
          minHeight: "60vh",
        }}
        dangerouslySetInnerHTML={{ __html: content }}
        
      />
    </div>
    
    
  );
}
