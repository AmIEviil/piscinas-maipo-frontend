import { useState } from "react";
import "./App.css";
import { useLogin } from "./hooks/LoginHooks";

function App() {
  const [users, setUsers] = useState<unknown>();

  const loginMutation = useLogin();

  const handleUsers = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const users = await loginMutation.mutateAsync();
      setUsers(users);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={handleUsers}>Usuarios</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <div>{users !== undefined ? JSON.stringify(users) : null}</div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
