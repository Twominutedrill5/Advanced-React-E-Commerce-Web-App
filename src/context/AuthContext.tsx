import { createContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../Library/Firebase/Firebase";
import { getDemoUser, clearDemoUser } from "../utils/authFallback";

type DemoUser = {
  uid: string;
  email: string | null;
  isDemo: boolean;
  role?: string;
};

type AppUser = User | DemoUser | null;

interface AuthContextType {
  user: AppUser;
  setUser: (user: AppUser) => void;
  role: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: (_user: AppUser) => {},
  role: "user",
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser>(null);
  const [role, setRole] = useState<string>("user");

  useEffect(() => {
    const cachedDemoUser = getDemoUser();
    if (cachedDemoUser) {
      setUser(cachedDemoUser as DemoUser);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        clearDemoUser();
        setUser(user);
      } else {
        const fallbackUser = getDemoUser();
        setUser((fallbackUser as DemoUser | null) ?? null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Look up the signed-in user's role ("admin" or "user") from Firestore so
  // admin-only UI (product management) can be gated - see users/{uid}.role.
  useEffect(() => {
    if (!user) {
      setRole("user");
      return;
    }

    if ("isDemo" in user && user.isDemo) {
      setRole(user.role || "admin");
      return;
    }

    let cancelled = false;
    getDoc(doc(db, "users", user.uid))
      .then((snapshot) => {
        if (!cancelled) {
          setRole(snapshot.data()?.role || "user");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRole("user");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser, role }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
