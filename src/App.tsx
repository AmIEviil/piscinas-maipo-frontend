import { useEffect } from "react";
import "./App.css";
import { Login } from "./views/login/LoginView";
import { useNavigate } from "react-router";
import { setNavigator } from "./utils/NavigationUtils";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);

  return (
    <>
      <Login />
    </>
  );
}

export default App;
