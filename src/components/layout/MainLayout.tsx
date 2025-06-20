import { Outlet } from "react-router";
import { TopBar } from "../topbar/TopBar";
import "./MainLayout.css";

export const BodyLayout = () => {
  return (
    <div className="mainLayoutContainer">
      <TopBar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};
