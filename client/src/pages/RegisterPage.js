import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  function validateForm() {
    const errors = {};
    if (username.length < 4) {
      errors.username = 'Username must be at least 4 characters long';
    }
    if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function register(ev) {
    ev.preventDefault();
    if (!validateForm()) {
      return;
    }

    const response = await fetch('http://localhost:4000/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.status === 200) {
      alert("Registration Successful");
      navigate('/');
    } else {
      alert("Registration Failed");
    }
  }

  return (
    <div>
      <form className="register" onSubmit={register}>
        <h1>Sign Up</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={ev => setUsername(ev.target.value)}
        />
        {errors.username && <p className="error">{errors.username}</p>}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={ev => setPassword(ev.target.value)}
        />
        {errors.password && <p className="error">{errors.password}</p>}
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}
