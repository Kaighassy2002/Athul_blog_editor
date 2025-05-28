import { useParams } from "react-router-dom";
import Editor from "./Editor";

const EditorWrapper = () => {
  const { id } = useParams();

  return <Editor id={id} />;
};

export default EditorWrapper;
