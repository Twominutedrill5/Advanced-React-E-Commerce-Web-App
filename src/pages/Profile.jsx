import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { deleteUser as deleteAuthUser } from "firebase/auth";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../Library/Firebase/Firebase";
import { clearDemoUser } from "../utils/authFallback";

export default function Profile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: "", address: "", email: "" });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      if (user.isDemo) {
        setProfile({ name: "Demo user", address: "", email: user.email || "" });
        return;
      }

      const userDoc = doc(db, "users", user.uid);
      const snapshot = await getDoc(userDoc);

      if (!snapshot.exists()) {
        await setDoc(
          userDoc,
          {
            email: user.email,
            name: "",
            address: "",
            createdAt: serverTimestamp(),
          },
          { merge: true },
        );
      }

      const data = snapshot.data() || {};
      setProfile({
        name: data.name || "",
        address: data.address || "",
        email: data.email || user.email || "",
      });
    };

    fetchProfile().catch((fetchError) => {
      setError(fetchError?.message || "Could not load profile data.");
    });
  }, [user, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!user) {
      return;
    }

    if (user.isDemo) {
      setStatus(
        "Demo user profile can be edited only after enabling Firebase email/password auth.",
      );
      return;
    }

    setIsSaving(true);
    setStatus("");
    setError("");

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          ...profile,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      setStatus("Profile saved.");
    } catch (saveError) {
      setError(saveError?.message || "Could not save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (!user) {
      return;
    }

    setError("");
    setStatus("");

    if (user.isDemo) {
      clearDemoUser();
      setUser(null);
      navigate("/");
      return;
    }

    try {
      await deleteDoc(doc(db, "users", user.uid));
      if (auth.currentUser) {
        await deleteAuthUser(auth.currentUser);
      }
      setUser(null);
      navigate("/");
    } catch (deleteError) {
      setError(deleteError?.message || "Could not delete account.");
    }
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="profile">
      <h2>Profile</h2>
      <p>Email: {profile.email || user.email}</p>
      <p>User ID: {user.uid}</p>
      <form onSubmit={saveProfile}>
        <input
          name="name"
          value={profile.name}
          onChange={handleChange}
          placeholder="Name"
        />
        <input
          name="address"
          value={profile.address}
          onChange={handleChange}
          placeholder="Address"
        />
        <button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save profile"}
        </button>
      </form>
      {status && <p>{status}</p>}
      {error && <p className="error">{error}</p>}
      <button
        type="button"
        onClick={deleteAccount}
        style={{
          backgroundColor: "crimson",
          color: "white",
          marginTop: "12px",
        }}
      >
        Delete account
      </button>
    </div>
  );
}
