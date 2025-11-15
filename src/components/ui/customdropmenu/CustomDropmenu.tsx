import { useEffect, useRef, useState } from "react";
import style from "./CustomDropmenu.module.css";
import { BarsIcon } from "../Icons/BarsIcon";
import { topbarOptions } from "../../../constant/routes";
import { useNavigate } from "react-router";

import EngineeringIcon from "@mui/icons-material/Engineering";
import HomeIcon from "@mui/icons-material/Home";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import InventoryIcon from "@mui/icons-material/Inventory";
import LogoutIcon from "../Icons/LogoutIcon";
import { useLoginStore } from "../../../store/AuthStore";
import { toUpperCaseFirstLetter } from "../../../utils/formatTextUtils";

const CustomDropmenu = () => {
  const logOutUser = useLoginStore((state) => state.logOutUser);
  const navigate = useNavigate();

  const modalRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const actualRoute = location.pathname.replace("/", "") || "Inicio";

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "home":
        return <HomeIcon />;
      case "clients":
        return <PeopleOutlineIcon />;
      case "inventory":
        return <InventoryIcon />;
      case "users":
        return <PeopleOutlineIcon />;
      case "works":
        return <EngineeringIcon />;
      case "logout":
        return <LogoutIcon />;
      default:
        return null;
    }
  };

  return (
    <div className={style.dropmenuContainer}>
      <span className={style.dropmenuLabel} onClick={() => setIsOpen(!isOpen)}>
        {toUpperCaseFirstLetter(actualRoute)}
        <BarsIcon size={16} color="white" className="icon w-5!" />
      </span>
      <div
        ref={modalRef}
        style={{ display: isOpen ? "block" : "none" }}
        className={style.dropmenuOptionsContainer}
      >
        {topbarOptions.map((option, index) => (
          <div
            key={index}
            className={style.optionLabel}
            onClick={() => {
              if (option.path === "logout") {
                // Aquí puedes agregar la lógica de cierre de sesión
                logOutUser();
              }
              navigate(option.path);
              setIsOpen(false);
            }}
          >
            {renderIcon(option.icon)}
            {option.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomDropmenu;
