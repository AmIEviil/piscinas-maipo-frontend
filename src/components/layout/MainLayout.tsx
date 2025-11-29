import { Outlet, useNavigate } from "react-router";
import { TopBar } from "../topbar/TopBar";
import "./MainLayout.css";
import { useEffect } from "react";
import SnackBar from "../ui/snackBar/SnackBar";
import { useBoundStore } from "../../store/BoundedStore";

export const BodyLayout = () => {
  const navigate = useNavigate();
  const tokenStore = useBoundStore((state) => state.token);
  const token = localStorage.getItem("token");

  // const currentPath = window.location.pathname;

  useEffect(() => {
    if (tokenStore === undefined || token === undefined) {
      navigate("/login");
      localStorage.removeItem("token");
      localStorage.removeItem("bound-store");
    }
    if (tokenStore !== undefined) {
      localStorage.setItem("token", tokenStore as string);
    }
  }, [tokenStore, token]);

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
        <SnackBar />
      </div>
    </div>
  );
};
