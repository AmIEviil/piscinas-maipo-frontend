import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import "./SnackBar.style.css";
import InfoIcon from "../Icons/InfoIcon";
import CircleCheckIcon from "../Icons/CircleCheckIcon";
import WarningIcon from "../Icons/WarningIcon";
import { useSnackBarResponseStore } from "../../../store/snackBarStore";
import ErrorIconV2 from "../Icons/ErrorIconV2";
import CloseIcon from "../Icons/CloseIcon";

const SnackBar = () => {
  const { t } = useTranslation();
  const setVisible = useSnackBarResponseStore(
    (state) => state.setSnackbarVisible
  );
  const showSnackBar = useSnackBarResponseStore(
    (state) => state.snackbarVisible
  );
  const message = useSnackBarResponseStore((state) => state.snackbarMessage);
  const type = useSnackBarResponseStore((state) => state.snackbarType);
  const duration = useSnackBarResponseStore((state) => state.snackbarDuration);
  const [animateClass, setAnimateClass] = useState("");

  useEffect(() => {
    if (showSnackBar) {
      setAnimateClass("show");
      const timer = setTimeout(() => {
        setAnimateClass("hide");
        setTimeout(() => {
          setVisible(false);
        }, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [showSnackBar, duration, setVisible]);

  const handleClose = () => {
    setAnimateClass("hide");
    setTimeout(() => {
      setVisible(false);
    }, 300);
  };

  const handleClassName = () => {
    switch (type) {
      case "success":
        return "success";
      case "error":
        return "error";
      case "warning":
        return "warning";
      default:
        return "info";
    }
  };

  if (!showSnackBar) return null;

  return (
    <div className={`snackbar-container ${animateClass} ${handleClassName()}`}>
      {type === "info" && <InfoIcon color="white" size={24} />}
      {type === "success" && <CircleCheckIcon color="white" size={24} />}
      {type === "warning" && <WarningIcon color="white" size={24} />}
      {type === "error" && <ErrorIconV2 color="white" size={24} />}
      <span className="mx-4">{t(message)}</span>
      <button className="snackbar-close-button" onClick={handleClose}>
        <CloseIcon />
      </button>
    </div>
  );
};

export default SnackBar;
