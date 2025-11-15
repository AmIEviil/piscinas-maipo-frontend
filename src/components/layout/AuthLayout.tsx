import { Outlet, useNavigate } from "react-router";
import "./AuthLayout.css";
import { useEffect } from "react";
import { useLoginStore } from "../../store/AuthStore";

export const AuthLayout = () => {
  const navigate = useNavigate();
  const tokenStore = useLoginStore((state) => state.userData?.accessToken);
  const token = tokenStore;

  const currentPath = window.location.pathname;

  useEffect(() => {
    if (tokenStore !== undefined && !currentPath.includes("activate")) {
      navigate("/");
    }
    if (token !== undefined && localStorage.getItem("token") === null) {
      localStorage.setItem("token", token);
    }
  }, [currentPath, navigate, token, tokenStore]);

  return (
    <div className="authLayoutContainer">
      <div className="auth-content">
        <Outlet />
      </div>
    </div>
  );
};
