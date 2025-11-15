import BodyLogin from "../../components/login/BodyLogin";
import HeaderLogin from "../../components/login/HeaderLogin";
import "./login.css";
// import { useBoundStore } from "../../store/BoundedStore";
// import { useEffect } from "react";
// import { useSesionStore } from "../../store/sesion/sesionStore";

export const Login = () => {
  // const resetShowErrorBox = useBoundStore((state) => state.resetShowErrorBox);

  // const clearMessageErrorBox = useBoundStore(
  //   (state) => state.clearMessageErrorBox
  // );
  // const clearRemainingAttemps = useBoundStore(
  //   (state) => state.clearRemainingAttemps
  // );
  // useEffect(() => {
  //   localStorage.setItem("refreshRetryCount", "0");
  //   return () => {
  //     localStorage.setItem("refreshRetryCount", "0");
  //     resetShowErrorBox();
  //     clearMessageErrorBox();
  //     clearRemainingAttemps();
  //   };
  // }, []);

  return (
    <div className="flex justify-center w-dvw h-dvh">
      <div className="background-container w-dvw h-dvh">
        <div className="loginView">
          <HeaderLogin />
          <BodyLogin />
        </div>
      </div>
    </div>
  );
};
