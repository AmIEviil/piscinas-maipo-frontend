import { Outlet } from "react-router";
import { TopBar } from "../topbar/TopBar";

export const BodyLayout = () => {
  return (
    <div>
      <TopBar />
      <Outlet />
    </div>
  );
};
