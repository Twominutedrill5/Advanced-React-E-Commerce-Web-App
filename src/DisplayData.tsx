import React, { useState, useEffect } from "react";
import { db } from "./Library/Firebase/Firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

interface User {
  id?: string; // id is optional, as it will only be available after data is fetched
  name: string;
  age: number;
}

type UserUpdate = Partial<Pick<User, "name" | "age">>;

const DisplayData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newAge, setNewAge] = useState<string>("");
  const [newName, setNewName] = useState<string>("");

  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const dataArray = querySnapshot.docs.map((snapshot) => ({
      id: snapshot.id,
      ...snapshot.data(),
    })) as User[];
    setUsers(dataArray);
  };

  // updateUser Function
  const updateUser = async (
    userId: string | undefined,
    updatedData: UserUpdate,
  ) => {
    if (!userId) {
      return;
    }

    const userDoc = doc(db, "users", userId);
    await updateDoc(userDoc, updatedData);
    await fetchUsers();
  };

  // deleteUser Function
  const deleteUser = async (userId: string | undefined) => {
    if (!userId) {
      return;
    }

    await deleteDoc(doc(db, "users", userId));
    await fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Users List</h2>
      {users.map((user) => (
        <div
          key={user.id}
          style={{ border: "2px solid black", margin: "10px" }}
        >
          <div key={user.id}>
            <p>Name: {user.name}</p>
            <p>Age: {user.age}</p>
          </div>
          <input
            onChange={(e) => setNewName(e.target.value)}
            type="text"
            placeholder="Enter new name:"
          />
          <button onClick={() => updateUser(user.id, { name: newName })}>
            Update Name
          </button>
          <input
            onChange={(e) => setNewAge(e.target.value)}
            type="number"
            placeholder="Enter new age:"
          />
          <button onClick={() => updateUser(user.id, { age: Number(newAge) })}>
            Update Age
          </button>
          <button
            style={{ backgroundColor: "crimson" }}
            onClick={() => deleteUser(user.id)}
          >
            Delete User
          </button>
        </div>
      ))}
    </div>
  );
};

export default DisplayData;
