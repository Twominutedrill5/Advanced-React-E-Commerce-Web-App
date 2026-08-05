import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../Library/Firebase/Firebase";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  createDemoUser,
  isAuthProviderDisabled,
  saveDemoUser,
  toAuthMessage,
} from "../utils/authFallback";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError("");
      navigate("/");
    } catch (err) {
      if (isAuthProviderDisabled(err)) {
        const demoUser = createDemoUser(email);
        saveDemoUser(demoUser);
        setUser(demoUser);
        setError(
          "Firebase email/password login is disabled, so a local demo account was used.",
        );
        navigate("/");
        return;
      }

      setError(toAuthMessage(err, "log in"));
    }
  };

  return (
    <div className="auth-form">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}
