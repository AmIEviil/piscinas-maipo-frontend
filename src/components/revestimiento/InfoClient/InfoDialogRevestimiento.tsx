import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { DialogTitle } from "@mui/material";
import style from "./InfoDialogRevestimiento.module.css";
import { formatMoneyNumber } from "../../../utils/formatTextUtils";
import { getWindowWidth } from "../../../utils/WindowUtils";

//Icons
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import HomeIcon from "@mui/icons-material/Home";
// import AddIcon from "@mui/icons-material/Add";
import PaidIcon from "@mui/icons-material/Paid";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PoolIcon from "@mui/icons-material/Pool";
// import WavesIcon from "@mui/icons-material/Waves";
import StraightenIcon from "@mui/icons-material/Straighten";
import WaterDropIcon from "@mui/icons-material/WaterDrop";

import { formatDateToDDMMYYYY } from "../../../utils/DateUtils";
import type { IRevestimiento } from "../../../service/revestimientoInterface";
// import { useCreateRevestimiento } from "../../../hooks/RevestimientoHooks";

interface InfoRevestimientoDialogProps {
  open: boolean;
  revestimientoInfo?: IRevestimiento;
  onClose: () => void;
}

const InfoRevestimientoDialog = ({
  open = false,
  revestimientoInfo,
  onClose,
}: InfoRevestimientoDialogProps) => {
  // const createRevestimiento = useCreateRevestimiento();
  const [windowWidth, setWindowWidth] = useState(getWindowWidth());
  console.log("width:", windowWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Limpieza al desmontar
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      fullWidth={true}
      maxWidth={"xl"}
      open={open}
      onClose={handleClose}
      style={{ borderRadius: 32 }}
    >
      <DialogTitle className={style.dialogTitle}>
        Detalle del Revestimiento
      </DialogTitle>
      <DialogContent>
        <div className="flex flex-row gap-2 mt-4">
          {revestimientoInfo && (
            <>
              <div className="flex flex-col">
                <span className="font-semibold text-lg">
                  Informacion del Cliente
                </span>
                <div className="flex flex-col w-full">
                  {revestimientoInfo && (
                    <div className={style.labelsContainer}>
                      <div className={style.labelItemContainer}>
                        <div className={style.labelItem}>
                          <PersonIcon className={style.iconItem} />
                          <span>{revestimientoInfo.client.nombre}</span>
                        </div>
                        <div className={style.labelItem}>
                          <EmailIcon className={style.iconItem} />
                          <span>
                            {revestimientoInfo.client.email
                              ? revestimientoInfo.client.email
                              : "Sin Email Registrado"}
                          </span>
                        </div>
                        <div className={style.labelItem}>
                          <HomeIcon className={style.iconItem} />
                          <span>
                            {revestimientoInfo.client.direccion
                              ? revestimientoInfo.client.direccion
                              : "Sin Dirección Registrada"}
                          </span>
                        </div>
                        <div className={style.labelItem}>
                          <PhoneIcon className={style.iconItem} />
                          <span>
                            {revestimientoInfo.client.telefono
                              ? revestimientoInfo.client.telefono
                              : "Sin Teléfono Registrado"}
                          </span>
                        </div>
                        <div className={style.labelItem}>
                          <LocationCityIcon className={style.iconItem} />
                          <span>{revestimientoInfo.client.comuna}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col w-full">
                <span className="font-semibold text-lg">
                  Informacion del Revestimiento
                </span>
                <div className={style.labelsContainer}>
                  <div className={style.labelItemContainer}>
                    <div className={style.labelItem}>
                      <CalendarMonthIcon className={style.iconItem} />
                      <span>
                        Fecha de Creación:{" "}
                        {formatDateToDDMMYYYY(revestimientoInfo.fechaPropuesta)}
                      </span>
                    </div>
                    <div className={style.labelItem}>
                      <PaidIcon className={style.iconItem} />
                      <span>
                        Valor x m²:{" "}
                        {formatMoneyNumber(revestimientoInfo.valorM2)}
                      </span>
                    </div>
                    <div className={style.labelItem}>
                      <PaidIcon className={style.iconItem} />
                      <span>
                        Costo mano de obra:{" "}
                        {formatMoneyNumber(revestimientoInfo.costoManoObra)}
                      </span>
                    </div>
                    <div className={style.labelItem}>
                      <PaidIcon className={style.iconItem} />
                      <span>
                        Costo Materiales:{" "}
                        {formatMoneyNumber(revestimientoInfo.costoMateriales)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col flex-wrap ">
                <span className="font-semibold text-lg">
                  <PoolIcon className={style.iconItem} />
                  Informacion de la Piscina
                </span>
                <div className="flex flex-wrap w-full">
                  <div className={style.labelItem}>
                    <StraightenIcon className={style.iconItem} />
                    <span>Largo: {revestimientoInfo.largoPiscina} mts</span>
                  </div>
                  <div className={style.labelItem}>
                    <StraightenIcon className={style.iconItem} />
                    <span>Ancho: {revestimientoInfo.anchoPiscina} mts</span>
                  </div>
                  <div className={style.labelItem}>
                    <StraightenIcon className={style.iconItem} />
                    <span>
                      Profundidad Min: {revestimientoInfo.profundidadMin} mts
                    </span>
                  </div>
                  <div className={style.labelItem}>
                    <StraightenIcon className={style.iconItem} />
                    <span>
                      Profundidad Max: {revestimientoInfo.profundidadMax} mts
                    </span>
                  </div>
                  <div className={style.labelItem}>
                    <StraightenIcon className={style.iconItem} />
                    <span>
                      Profundidad Promedio: {revestimientoInfo.profundidadAvg}{" "}
                      mts
                    </span>
                  </div>
                  <div className={style.labelItem}>
                    <StraightenIcon className={style.iconItem} />
                    <span>Area: {revestimientoInfo.areaPiscina} mts</span>
                  </div>
                  <div className={style.labelItem}>
                    <WaterDropIcon className={style.iconItem} />
                    <span>Volumen: {revestimientoInfo.volumenPiscina} mts</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default InfoRevestimientoDialog;
