import { format } from "date-fns";
import { useContext, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";

export default function PostPage() {
    const [postInfo, setPostInfo] = useState(null);
    const { id } = useParams();
    const { userInfo } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://localhost:4000/post/${id}`)
            .then(response => {
                response.json().then(postInfo => {
                    setPostInfo(postInfo);
                });
            });
    }, [id]);

    const handleDelete = async () => {
        const response = await fetch(`http://localhost:4000/post/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (response.ok) {
            navigate('/');
        } else {
            console.error("Failed to delete the post");
        }
    };

    if (!postInfo) return '';
    return (
        <div className="post-page">
            <h1>{postInfo.title}</h1>
            <time style={{color: "#333"}}>{format(new Date(postInfo.createdAt), 'MMM dd, yyyy')}</time>
            <div className="author">by @{postInfo.author.username}</div>
            {userInfo.id === postInfo.author._id && (
                <div className="edit-row">
                    <Link className="edit-btn" to={`/edit/${postInfo._id}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>

                        Edit this post</Link>
                        <div style={{margin: "2px"}}><Link className="delete-btn" onClick={handleDelete}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18.75V8.25A2.25 2.25 0 0 1 8.25 6h7.5A2.25 2.25 0 0 1 18 8.25v10.5M9 10h6M9 14h6M10.5 18H13.5M10.5 2.25H13.5M9 4.5h6M10.5 4.5v-2.25H13.5V4.5" />
                        </svg>
                            Delete</Link></div>
                </div>
            )}
            
            <div className="image">
                <img src={`http://localhost:4000/${postInfo.cover}`} alt="img"></img>
            </div>
            <div className="content" dangerouslySetInnerHTML={{ __html: postInfo.content }} />

        </div>
    );
}