import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listAllBlogsAPI } from '../server/allAPI';

function Home() {
  const navigate = useNavigate();
  const [blogList, setBlogList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await listAllBlogsAPI();
        console.log('API response:', response);

        // Assuming response.data is an array of blogs
        setBlogList(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setBlogList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Navigate to editor passing blog id via URL param or state
  const handleEdit = (blogId) => {
    // Using URL param (recommended)
    navigate(`/editor/${blogId}`);
    
    // Or if you want to pass via state (less common for ids):
    // navigate('/editor', { state: { blogId } });
  };

  return (
    <div>
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Welcome to the Blog Editor</h1>
        <button className="btn btn-primary" onClick={() => navigate('/editor')}>
          Go to Editor (New)
        </button>
      </div>

      <div className="container bg-light py-5">
        {loading ? (
          <p>Loading blogs...</p>
        ) : blogList.length === 0 ? (
          <p>No blogs found.</p>
        ) : (
          <ul>
            {blogList.map((blog) => (
              <li key={blog._id}>
                <button
                  className="btn btn-link"
                  onClick={() => handleEdit(blog._id)}  // Pass ID here
                >
                  {blog.title || 'Untitled Blog'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Home;
