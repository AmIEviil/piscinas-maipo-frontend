import { useNavigate } from "react-router";
import Button from "../ui/button/Button";
import "./common.css";

export const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center gap-4 p-10 h-dvh">
      <div className="notfound-title">Lo sentimos, algo anda mal</div>
      <div className="notfound-subtitle">
        No podemos encontrar lo que buscas
      </div>
      <Button
        className="width-[107px]"
        label="Volver al inicio"
        onClick={() => navigate("/")}
      ></Button>
    </div>
  );
};
