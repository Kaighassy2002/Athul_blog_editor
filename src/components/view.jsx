import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { blogByIdAPI } from '../server/allAPI';

function View() {
  const { id } = useParams(); // get blog ID from route like /view/:id
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await blogByIdAPI(id);
        setBlog(response.data.data); // Adjust if your response shape is different
      } catch (err) {
        setError("Failed to load blog content.");
      }
    };

    fetchBlog();
  }, [id]);

  if (error) return <div className="text-red-500">{error}</div>;
  if (!blog) return <div>Loading...</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
      {/* Render HTML content */}
      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: blog.body }}
      />
    </div>
  );
}

export default View;
