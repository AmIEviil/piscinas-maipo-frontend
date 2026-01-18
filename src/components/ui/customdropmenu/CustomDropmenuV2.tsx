import { type ReactNode, useEffect, useRef, useState } from "react";
import style from "./CustomDropmenu.module.css";

type DropmenuVariant = "primary" | "secondary" | "danger" | "ghost";
interface CustomDropmenuV2Props {
  options: {
    label: string;
    onClick: () => void;
  }[];
  icon: ReactNode;
  label?: string;
  typeClass?: DropmenuVariant;
}

const CustomDropmenuV2 = ({
  options,
  icon,
  label,
  typeClass = "primary",
}: CustomDropmenuV2Props) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const typeClassMap = {
    primary: style.primary,
    secondary: style.secondary,
    danger: style.danger,
    ghost: style.ghost,
  } as const;

  const resolvedClass = typeClassMap[typeClass ?? "primary"];

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
      <button
        type="button"
        className={`${style.dropmenuLabel} ${resolvedClass}`}
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {label && <span>{label}</span>}
        {icon}
      </button>

      {isOpen && (
        <div
          ref={modalRef}
          className={`${style.dropmenuOptionsContainer} ${resolvedClass}`}
          role="menu"
        >
          {options.map((option, index) => (
            <button
              key={option.label + index}
              type="button"
              className={`${style.optionLabel} ${resolvedClass}`}
              role="menuitem"
              onClick={() => {
                option.onClick();
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropmenuV2;
