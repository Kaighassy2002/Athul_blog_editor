import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listAllBlogsAPI, listAllScribbleAPI } from '../server/allAPI';

function Home() {
  const navigate = useNavigate();
  const [blogList, setBlogList] = useState([]);
  const [scribbleList, setScribbleList] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [loadingScribbles, setLoadingScribbles] = useState(true);

  // Pagination
  const itemsPerPage = 6;
  const [blogPage, setBlogPage] = useState(1);
  const [scribblePage, setScribblePage] = useState(1);

  // Search
  const [blogSearch, setBlogSearch] = useState('');
  const [scribbleSearch, setScribbleSearch] = useState('');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await listAllBlogsAPI();
        setBlogList(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setBlogList([]);
      } finally {
        setLoadingBlogs(false);
      }
    };

    const fetchScribbles = async () => {
      try {
        const response = await listAllScribbleAPI();
        setScribbleList(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        console.error('Error fetching scribbles:', error);
        setScribbleList([]);
      } finally {
        setLoadingScribbles(false);
      }
    };

    fetchBlogs();
    fetchScribbles();
  }, []);

const handleEdit = (type, item) => {
  if (!item?.slug || !item?._id) {
    console.error("Missing slug or _id for", type, item);
    return;
  }
  navigate(`/editor/${type}/${item.slug}/${item._id}`);
};



  const getFirstTextPreview = (content, maxLength = 50) => {
    try {
      const blocks = content?.root?.children || [];
      for (let block of blocks) {
        const text = block?.children?.[0]?.text;
        if (text) return text.slice(0, maxLength) + '...';
      }
      return ' Image content...';
    } catch {
      return 'No preview available...';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filtered Lists
  const filteredBlogs = blogList.filter((b) =>
    b.title?.toLowerCase().includes(blogSearch.toLowerCase())
  );
  const filteredScribbles = scribbleList.filter((s) =>
    s.title?.toLowerCase().includes(scribbleSearch.toLowerCase())
  );

  // Paginate
  const totalBlogPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const paginatedBlogs = filteredBlogs.slice(
    (blogPage - 1) * itemsPerPage,
    blogPage * itemsPerPage
  );

  const totalScribblePages = Math.ceil(filteredScribbles.length / itemsPerPage);
  const paginatedScribbles = filteredScribbles.slice(
    (scribblePage - 1) * itemsPerPage,
    scribblePage * itemsPerPage
  );

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="mb-3">Welcome to the Blog & Scribble Editor</h1>
        <button className="btn btn-primary" onClick={() => navigate('/editor')}>
          Create New
        </button>
      </div>

      {/* BLOG SECTION */}
      <section className="mb-5">
        <h2 className="mb-4">📚 Blogs</h2>

       <div className="input-group input-group-md mb-4">
          <input
            type="text"
            placeholder="Search blogs by title..."
            className="form-control "
            value={blogSearch}
            onChange={(e) => {
              setBlogSearch(e.target.value);
              setBlogPage(1); // reset to page 1
            }}
          />
          <span className="input-group-text">
    <i className="fa-solid fa-magnifying-glass"></i>
  </span>
       </div>
        {loadingBlogs ? (
          <p>Loading blogs...</p>
        ) : filteredBlogs.length === 0 ? (
          <p>No blogs found.</p>
        ) : (
          <>
            <div className="row">
              {paginatedBlogs.map((blog) => (
                <div key={blog._id} className="col-md-4 mb-4">
                  <div className="card h-100 shadow-sm border-0">
                    <div className="card-body">
                     <div className='d-flex justify-content-between'>
                        <h5 className="card-title">{blog.title || 'Untitled Blog'}</h5>
                        <p className="text-secondary small mb-2">
                           {formatDate(blog.createdAt)}
                        </p>
                     </div>
                      <p className="card-text text-muted small mb-1">
                        {getFirstTextPreview(blog.content, 25)}
                      </p>
                      
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleEdit('blog', blog)}
                      >
                        Edit Blog
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <CustomPagination
              currentPage={blogPage}
              totalPages={totalBlogPages}
              setPage={setBlogPage}
            />
          </>
        )}
      </section>

      {/* SCRIBBLE SECTION */}
      <section>
        <h2 className="mb-4">✍️ Scribbles</h2>

        <div className="input-group input-group-md mb-4">
  <input
    type="text"
    className="form-control"
    placeholder="Search scribbles by title..."
    value={scribbleSearch}
    onChange={(e) => {
      setScribbleSearch(e.target.value);
      setScribblePage(1);
    }}
  />
  <span className="input-group-text">
    <i className="fa-solid fa-magnifying-glass"></i>
  </span>
</div>


        {loadingScribbles ? (
          <p>Loading scribbles...</p>
        ) : filteredScribbles.length === 0 ? (
          <p>No scribbles found.</p>
        ) : (
          <>
            <div className="row">
              {paginatedScribbles.map((scribble) => (
                <div key={scribble._id} className="col-md-4 mb-4">
                  <div className="card h-100 shadow-sm border-0">
                    <div className="card-body">
                     <div className='d-flex justify-content-between'>
                       <h5 className="card-title">{scribble.title || 'Untitled Scribble'}</h5>
                       <p className="text-secondary small mb-2">
                         {formatDate(scribble.createdAt)}
                      </p>
                       </div>
                      <p className="card-text text-muted small mb-1">
                        {getFirstTextPreview(scribble.content, 25)}
                      </p>
                      
                      <button
                        className="btn btn-outline-success btn-sm"
                        onClick={() => handleEdit('scribble', scribble)}

                      >
                        Edit Scribble
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <CustomPagination
              currentPage={scribblePage}
              totalPages={totalScribblePages}
              setPage={setScribblePage}
            />
          </>
        )}
      </section>
    </div>
  );
}

// ✅ Pagination Component
function CustomPagination({ currentPage, totalPages, setPage }) {
  if (totalPages <= 1) return null;

  return (
    <div className="d-flex justify-content-center mt-4">
      <ul className="pagination pagination-sm">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => setPage(currentPage - 1)}>
            «
          </button>
        </li>

        {[...Array(totalPages)].map((_, index) => (
          <li
            key={index}
            className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
          >
            <button className="page-link" onClick={() => setPage(index + 1)}>
              {index + 1}
            </button>
          </li>
        ))}

        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => setPage(currentPage + 1)}>
            »
          </button>
        </li>
      </ul>
    </div>
  );
}

export default Home;
