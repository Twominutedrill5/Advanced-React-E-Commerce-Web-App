import { useContext } from "react";
import AuthContext from "./AuthContext";

// Split into its own file so AuthContext.tsx only exports components
// (keeps React Fast Refresh working there).
export const useAuth = () => useContext(AuthContext);
