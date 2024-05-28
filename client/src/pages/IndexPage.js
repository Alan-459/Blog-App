import { useEffect, useState } from "react";
import Post from "../Post";

export default function IndexPage() {
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPosts, setFilteredPosts] = useState([]);

    useEffect(() => {
        fetch('http://localhost:4000/post').then(response => {
            response.json().then(posts => {
                setPosts(posts);
                setFilteredPosts(posts);
            });
        });
    }, []);

    useEffect(() => {
        const filtered = posts.filter(post => 
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) 
            // ||
            // post.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredPosts(filtered);
    }, [searchTerm, posts]);

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
        </>
    );
}
