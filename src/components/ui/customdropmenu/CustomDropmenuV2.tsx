import { useEffect, useRef, useState } from "react";
import style from "./CustomDropmenu.module.css";

interface CustomDropmenuV2Props {
  options: {
    label: string;
    onClick: () => void;
  }[];
  icon: React.ReactNode;
}

const CustomDropmenuV2 = ({ options, icon }: CustomDropmenuV2Props) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <div className={style.dropmenuContainer}>
      <span className={style.dropmenuLabel} onClick={() => setIsOpen(!isOpen)}>
        {icon}
      </span>
      <div
        ref={modalRef}
        style={{ display: isOpen ? "block" : "none" }}
        className={style.dropmenuOptionsContainer}
      >
        {options.map((option, index) => (
          <div
            key={index}
            className={style.optionLabel}
            onClick={option.onClick}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomDropmenuV2;
