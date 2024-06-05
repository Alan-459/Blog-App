import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "./UserContext";

export default function Header(){
  const {setUserInfo, userInfo} = useContext(UserContext);
  useEffect(() => {
    fetch('http://localhost:4000/profile',{
     credentials: 'include'
    }).then(response => {
      response.json().then(userInfo => {
        setUserInfo(userInfo);
      });
    });
  },[setUserInfo]);

  function Logout(){
    fetch('http://localhost:4000/logout',{
      credentials: 'include',
      method: 'POST'
    });
    setUserInfo(null);
     window.location.reload();
  }

  const username = userInfo?.username;  
    return(
        <header>
        <Link to ="/" className="logo">Blogify</Link>
        <nav>
          {username && (
            <>
            <Link to ='/create'>Create new post</Link>
            <a href="/" onClick={Logout}>Logout</a>
            </>
          )}
          {!username && (
            <>
            <Link to ="/login">Login</Link>
            <Link to ="/register">UserRegister</Link>
            </>
          )}
        </nav>
      </header>
    );
}
