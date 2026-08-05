import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../Library/Firebase/Firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { clearDemoUser } from "../utils/authFallback";

const Logout = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleLogout = async () => {
      clearDemoUser();
      setUser(null);

      try {
        await signOut(auth);
      } catch (err) {
        console.error("Logout failed:", err);
      }
      

      navigate("/");
    };

    handleLogout();
  }, [navigate, setUser]);

  return <p>Logging out...</p>;
};

export default Logout;
