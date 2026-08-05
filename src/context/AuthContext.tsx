import { createContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../Library/Firebase/Firebase";
import { getDemoUser, clearDemoUser } from "../utils/authFallback";

type DemoUser = {
  uid: string;
  email: string | null;
  isDemo: boolean;
};

type AppUser = User | DemoUser | null;

interface AuthContextType {
  user: AppUser;
  setUser: (user: AppUser) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: (_user: AppUser) => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser>(null);

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

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
