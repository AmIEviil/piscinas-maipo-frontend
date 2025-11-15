import { Outlet, useNavigate } from "react-router";
import { TopBar } from "../topbar/TopBar";
import "./MainLayout.css";
import { useEffect } from "react";
import { useLoginStore } from "../../store/AuthStore";

export const BodyLayout = () => {
  const navigate = useNavigate();
  const tokenStore = useLoginStore((state) => state.token);
  const token = localStorage.getItem("token");

  // const currentPath = window.location.pathname;
  
  useEffect(() => {
    if (tokenStore === undefined || token === undefined) {
      navigate("/login");
    }
    if (tokenStore !== undefined || token !== undefined) {
      navigate("/");
    }
  }, [token]);

  // useEffect(() => {
  //   if (validateToken.isSuccess) {
  //     if (
  //       validateToken?.data?.valid === false ||
  //       validateToken?.data?.valid === undefined ||
  //       token === undefined
  //     ) {
  //       navigate("/login");
  //     }
  //   } else if (validateToken.isError || token === undefined) {
  //     navigate("/login");
  //   }
  // }, [validateToken.isFetched]);

  return (
    <div className="mainLayoutContainer">
      <TopBar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};
