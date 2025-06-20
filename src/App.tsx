import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { useLogin } from "./hooks/LoginHooks";
import { useClient } from "./hooks/ClientHooks";

function App() {
  const [users, setUsers] = useState<unknown>();
  const [clients, setClients] = useState<unknown>();

  const loginMutation = useLogin();
  const clientMutation = useClient();

  const handleUsers = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const users = await loginMutation.mutateAsync();
      setUsers(users);
      const clients = await clientMutation.mutateAsync();
      setClients(clients);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={handleUsers}>Usuarios</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <div>{users !== undefined ? JSON.stringify(users) : null}</div>
      <div>{clients !== undefined ? JSON.stringify(clients) : null}</div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
