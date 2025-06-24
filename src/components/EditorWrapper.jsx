import { useParams } from "react-router-dom";
import Editor from "./Editor";

const EditorWrapper = () => {
  const { type, slug, id } = useParams();  
  return <Editor id={id} type={type} />;
};

export default EditorWrapper;
