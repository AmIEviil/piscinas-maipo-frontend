import { Outlet, useNavigate } from "react-router";
import "./AuthLayout.css";
import { useEffect } from "react";
import { useBoundStore } from "../../store/BoundedStore";

export const AuthLayout = () => {
  const navigate = useNavigate();
  const token = useBoundStore((state) => state.token);

  const currentPath = window.location.pathname;

  useEffect(() => {
    if (token !== undefined) {
      console.log("Token found, navigating to home.");
      navigate("/");
      localStorage.setItem("token", token as string);
    }
    if (token !== undefined && localStorage.getItem("token") === null) {
      localStorage.setItem("token", token);
    }
  }, [currentPath, navigate, token]);

  return (
    <div className="authLayoutContainer">
      <div className="auth-content">
        <Outlet />
      </div>
    </div>
  );
};
