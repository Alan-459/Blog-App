import { format } from "date-fns";
import { Link } from "react-router-dom";

export default function Post({_id, title, summary, cover, createdAt, author}){
    return(
        <div className="post">
            <div className="image">
                <Link to={`/post/${_id}`}>
                    <img src={`http://localhost:4000/${cover}`} alt="img" />
                </Link>
            </div>
            <div className="text"> 
                <Link to={`/post/${_id}`}>
                    <h2>{title}</h2>
                </Link> 
                <p className="info">
                    <p className="author">{author.username}</p>
                    <time style={{color: "#333"}}>{format(new Date(createdAt), 'MMM dd, yyyy')}</time>
                </p>
                <p className="summary">{summary}</p>
            </div>
        </div>
    );
}
