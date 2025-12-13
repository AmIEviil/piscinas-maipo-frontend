import style from "./TopBar.module.css";
import PiscinasElMaipoIcon from "../ui/Icons/piscinasDelMaipoIcon";
import CustomDropmenu from "../ui/customdropmenu/NavBarComponent";

export const TopBar = () => {
  return (
    <div className={style.topBarContainer}>
      <div className={style.headerModuleContainer}>
        <PiscinasElMaipoIcon
          size={90}
          color="white"
          className={`${style.iconHeader} icon`}
        />
        <span>Piscinas El Maipo</span>
      </div>
      <CustomDropmenu />
    </div>
  );
};
