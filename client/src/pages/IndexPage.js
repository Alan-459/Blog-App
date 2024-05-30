import { useEffect, useState } from "react";
import Post from "../Post";

export default function IndexPage() {
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetch(`http://localhost:4000/post?page=${page}&limit=10`).then(response => {
            response.json().then(data => {
                setPosts(data.posts);
                setFilteredPosts(data.posts);
                setTotalPages(data.totalPages);
            });
        });
    }, [page]);

    useEffect(() => {
        const filtered = posts.filter(post => 
            post.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredPosts(filtered);
    }, [searchTerm, posts]);

    const handleNextPage = () => {
        if (page < totalPages) {
            setPage(page + 1);
        }
    };

    const handlePreviousPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    return (
        <>
            <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {filteredPosts.length > 0 && filteredPosts.map(post => (
                <Post key={post.id} {...post} />
            ))}
            <div className="pagination">
                <button  onClick={handlePreviousPage} disabled={page === 1} >
                {"◀︎"}
                </button>
                <div>Page {page} of {totalPages}</div>
                <button onClick={handleNextPage} disabled={page === totalPages}>
                    {"▶︎"}
                </button>
            </div>
        </>
    );
}
