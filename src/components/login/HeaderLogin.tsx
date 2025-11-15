import PiscinasElMaipoIcon from "../ui/Icons/piscinasDelMaipoIcon";
import style from "./HeaderLogin.module.css";

const HeaderLogin = () => {
  return (
    <div className={style.headerLogin}>
      <div className={style.headerContent}>
        <span className={style.iconHeader}>
          <PiscinasElMaipoIcon size={180} />
        </span>
        <div className={style.textHeader}>
          Bienvenido a la plataforma. Por favor, ingresa tus credenciales para
          continuar.
        </div>
      </div>
    </div>
  );
};

export default HeaderLogin;
