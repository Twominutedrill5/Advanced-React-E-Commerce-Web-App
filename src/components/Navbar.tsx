import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { user } = useAuth();
  return (
    <div>
      <Link to="/">Home</Link>
      <Link to="/cart">Cart</Link>
      {user ? (
        <>
          <Link to="/profile">Profile</Link>
          <Link to="/logout">Logout</Link>
        </>
      ) : (
        <>
          <Link to="/register">Register</Link>
          <Link to="/login">Login</Link>
        </>
      )}
    </div>
  );
};

export default Navbar;
