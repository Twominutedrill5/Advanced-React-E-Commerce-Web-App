import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth } from "../Library/Firebase/Firebase";
import { db } from "../Library/Firebase/Firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  createDemoUser,
  isAuthProviderDisabled,
  saveDemoUser,
  toAuthMessage,
} from "../utils/authFallback";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await setDoc(
        doc(db, "users", credential.user.uid),
        {
          email: credential.user.email,
          name: "",
          address: "",
          role: "user",
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );
      setError("");
      navigate("/");
    } catch (err) {
      if (isAuthProviderDisabled(err)) {
        const demoUser = createDemoUser(email);
        saveDemoUser(demoUser);
        setUser(demoUser);
        setError(
          "Firebase email/password signup is disabled, so a local demo account was used.",
        );
        navigate("/");
        return;
      }

      setError(toAuthMessage(err, "register"));
    }
  };

  return (
    <div className="auth-form">
      <h2>Register</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleRegister}>
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
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
