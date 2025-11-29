import { useEffect, useRef, useState } from "react";
import s from "./SeeMoreButton.module.css";
import EyeIcon from "../../ui/Icons/EyeIcon";
import { Tooltip } from "@mui/material";

interface SeeMoreButtonProps {
  content?: string;
}

const SeeMoreButton = ({ content }: SeeMoreButtonProps) => {
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
    <div className={s.dropmenuContainer}>
      <Tooltip title="Ver Observaciones" arrow leaveDelay={0}>
        <span
          className={`${s.dropmenuLabel} ${isOpen ? s.active : ""}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <EyeIcon
            open={isOpen}
            className={`${s.dropmenuIcon} ${isOpen ? s.active : ""}`}
            size={24}
          />
        </span>
      </Tooltip>
      <div
        ref={modalRef}
        style={{ display: isOpen ? "block" : "none" }}
        className={s.dropmenuOptionsContainer}
      >
        <div className={s.optionLabel}>{content}</div>
      </div>
    </div>
  );
};

export default SeeMoreButton;
