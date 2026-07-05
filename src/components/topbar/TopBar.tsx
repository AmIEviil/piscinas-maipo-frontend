import style from "./TopBar.module.css";
import PiscinasElMaipoIcon from "../ui/Icons/piscinasDelMaipoIcon";
import CustomDropmenu from "../ui/customdropmenu/NavBarComponent";
import ThemeToggle from "../ui/ThemeToggle/ThemeToggle";

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
      <div className={style.topBarActions}>
        <ThemeToggle />
        <CustomDropmenu />
      </div>
    </div>
  );
};
