import style from "./InfoDialogRevestimiento.module.css";
import { formatMoneyNumber } from "../../../utils/formatTextUtils";
import { formatDateToDDMMYYYY } from "../../../utils/DateUtils";
import Button from "../../ui/button/Button";

// Icons
import PersonIcon from "@mui/icons-material/Person";
import PoolIcon from "@mui/icons-material/Pool";
import ConstructionIcon from "@mui/icons-material/Construction";
import DescriptionIcon from "@mui/icons-material/Description";
import ImageIcon from "@mui/icons-material/Image";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import type { IRevestimiento } from "../../../service/revestimiento.interface";
import { Modal } from "react-bootstrap";
import type { IUploadedFile } from "../../../service/UploadedFiles.interface";
import ListFilesPropuestas from "./ListPropuestas";

interface InfoRevestimientoDialogProps {
  open: boolean;
  revestimientoInfo?: IRevestimiento;
  filesPropuesta?: IUploadedFile[];
  onClose: () => void;
  handleGeneratePropuesta?: () => void;
}

const InfoRevestimientoDialog = ({
  open = false,
  revestimientoInfo,
  filesPropuesta,
  onClose,
  handleGeneratePropuesta,
}: InfoRevestimientoDialogProps) => {
  const handleClose = () => {
    onClose();
  };

  if (!revestimientoInfo) return null;

  // Calcular total de extras para mostrar resumen si es necesario
  const totalExtras =
    revestimientoInfo.extras?.reduce(
      (acc, curr) => acc + Number(curr.valor),
      0,
    ) || 0;

  return (
    <Modal
      size="xl"
      show={open}
      onHide={handleClose}
      style={{ borderRadius: 24, padding: "1rem" }}
    >
      <Modal.Header className={style.dialogTitle}>
        <h4 className="self-start">Detalle del Proyecto de Revestimiento</h4>
        <div className="flex flex-row justify-between items-center mt-2 w-full">
          <div className="flex flex-col text-sm font-normal text-gray-500 mt-1">
            <span>ID: {revestimientoInfo.id} </span>
            <span>
              Estado:
              <span className="font-bold text-blue-600">
                {revestimientoInfo.estado}
              </span>
            </span>
          </div>
          <div className="">
            {!filesPropuesta?.length && (
              <Button
                label="Generar Propuesta PDF"
                variant="secondary"
                onClick={handleGeneratePropuesta}
              />
            )}
            {filesPropuesta && filesPropuesta.length > 0 && (
              <ListFilesPropuestas
                files={filesPropuesta}
                handleGeneratePropuesta={handleGeneratePropuesta}
              />
            )}
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="custom-scrollbar">
        <div className={style.contentContainer}>
          {/* Sección 1: Cliente */}
          <div className={style.section}>
            <h4 className={style.sectionTitle}>
              <PersonIcon /> Información del Cliente
            </h4>
            <div className={style.gridContainer}>
              <div className={style.infoItem}>
                <span className={style.label}>Nombre</span>
                <span className={style.value}>
                  {revestimientoInfo.client.nombre}
                </span>
              </div>
              <div className={style.infoItem}>
                <span className={style.label}>Teléfono</span>
                <span className={style.value}>
                  {revestimientoInfo.client.telefono}
                </span>
              </div>
              <div className={style.infoItem}>
                <span className={style.label}>Email</span>
                <span className={style.value}>
                  {revestimientoInfo.client.email || "-"}
                </span>
              </div>
              <div className={style.infoItem}>
                <span className={style.label}>Dirección</span>
                <span className={style.value}>
                  {revestimientoInfo.client.direccion},{" "}
                  {revestimientoInfo.client.comuna}
                </span>
              </div>
            </div>
          </div>

          {/* Sección 2: Piscina */}
          <div className={style.section}>
            <h4 className={style.sectionTitle}>
              <PoolIcon /> Dimensiones de la Piscina
            </h4>
            <div className={style.gridContainer}>
              <div className={style.infoItem}>
                <span className={style.label}>Dimensiones (L x A)</span>
                <span className={style.value}>
                  {revestimientoInfo.largoPiscina}m x{" "}
                  {revestimientoInfo.anchoPiscina}m
                </span>
              </div>
              <div className={style.infoItem}>
                <span className={style.label}>Profundidad (Min - Max)</span>
                <span className={style.value}>
                  {revestimientoInfo.profundidadMin}m -{" "}
                  {revestimientoInfo.profundidadMax}m
                </span>
              </div>
              <div className={style.infoItem}>
                <span className={style.label}>Profundidad Promedio</span>
                <span className={style.value}>
                  {revestimientoInfo.profundidadAvg}m
                </span>
              </div>
              <div className={style.infoItem}>
                <span className={style.label}>Área Total</span>
                <span className={style.value}>
                  {revestimientoInfo.areaPiscina} m²
                </span>
              </div>
              <div className={style.infoItem}>
                <span className={style.label}>Volumen Total</span>
                <span className={style.value}>
                  {revestimientoInfo.volumenPiscina} m³
                </span>
              </div>
            </div>
          </div>

          {/* Sección 3: Revestimiento y Costos */}
          <div className={style.section}>
            <h4 className={style.sectionTitle}>
              <ConstructionIcon /> Revestimiento y Costos
            </h4>
            <div className={style.gridContainer}>
              <div className={style.infoItem}>
                <span className={style.label}>Tipo Material</span>
                <span className={style.value}>
                  {revestimientoInfo.tipoRevestimiento}
                </span>
              </div>
              <div className={style.infoItem}>
                <span className={style.label}>Valor por m²</span>
                <span className={style.value}>
                  {formatMoneyNumber(revestimientoInfo.valorM2)}
                </span>
              </div>
              <div className={style.infoItem}>
                <span className={style.label}>Costo Mano de Obra</span>
                <span className={style.value}>
                  {formatMoneyNumber(revestimientoInfo.costoManoObra)}
                </span>
              </div>
              <div className={style.infoItem}>
                <span className={style.label}>Costo Materiales</span>
                <span className={style.value}>
                  {formatMoneyNumber(revestimientoInfo.costoMateriales)}
                </span>
              </div>
              <div className={style.infoItem}>
                <span className={style.label}>Costo Total Interno</span>
                <span className={style.value}>
                  {formatMoneyNumber(revestimientoInfo.costoTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Sección 4: Extras (Nuevo) */}
          {revestimientoInfo.extras && revestimientoInfo.extras.length > 0 && (
            <div className={style.section}>
              <h4 className={style.sectionTitle}>
                <LibraryAddIcon /> Extras Adicionales
              </h4>
              <div className={style.extrasList}>
                {revestimientoInfo.extras.map((extra) => (
                  <div key={extra.id} className={style.extraItem}>
                    <div>
                      <div className={style.extraName}>{extra.nombre}</div>
                      {extra.detalle && (
                        <div className={style.extraDetail}>{extra.detalle}</div>
                      )}
                    </div>
                    <div className={style.extraValue}>
                      {formatMoneyNumber(Number(extra.valor))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sección 5: Detalles y Fechas */}
          <div className={style.section}>
            <h4 className={style.sectionTitle}>
              <DescriptionIcon /> Detalles y Fechas
            </h4>
            <div className={style.gridContainer}>
              <div className={style.infoItem} style={{ gridColumn: "1 / -1" }}>
                <span className={style.label}>Detalles / Observaciones</span>
                <p className="text-gray-800 mt-1 whitespace-pre-wrap">
                  {revestimientoInfo.detalles || "Sin observaciones"}
                </p>
              </div>
              <div className={style.infoItem}>
                <span className={style.label}>Garantía</span>
                <span className={style.value}>
                  {revestimientoInfo.garantia || "N/A"}
                </span>
              </div>
              <div className={style.infoItem}>
                <span className={style.label}>Fecha Propuesta</span>
                <span className={style.value}>
                  {formatDateToDDMMYYYY(revestimientoInfo.fechaPropuesta)}
                </span>
              </div>
              <div className={style.infoItem}>
                <span className={style.label}>Inicio Obra</span>
                <span className={style.value}>
                  {formatDateToDDMMYYYY(revestimientoInfo.fechaInicio)}
                </span>
              </div>
              <div className={style.infoItem}>
                <span className={style.label}>Término Obra</span>
                <span className={style.value}>
                  {formatDateToDDMMYYYY(revestimientoInfo.fechaTermino)}
                </span>
              </div>
            </div>
          </div>

          {/* Sección 6: Imágenes */}
          {revestimientoInfo.imagenes &&
            revestimientoInfo.imagenes.length > 0 && (
              <div className={style.section}>
                <h4 className={style.sectionTitle}>
                  <ImageIcon /> Galería de Imágenes
                </h4>
                <div className={style.imagesGrid}>
                  {revestimientoInfo.imagenes.map((img) => (
                    <div key={img.public_id} className={style.imageCard}>
                      <a
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ver imagen completa"
                      >
                        <img
                          src={img.url}
                          alt="Evidencia"
                          className={style.image}
                        />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Resumen Final (Footer interno) */}
          <div className={style.totalSection}>
            <div className={style.totalItem}>
              <span className={style.totalLabel}>Valor Base Revestimiento</span>
              <span className="text-xl font-bold text-gray-600">
                {formatMoneyNumber(
                  revestimientoInfo.valorTotal - totalExtras, // Asumiendo valorTotal ya incluye extras, restamos para mostrar desglose, o ajusta según tu lógica
                )}
              </span>
            </div>
            {totalExtras > 0 && (
              <div className={style.totalItem}>
                <span className={style.totalLabel}>Total Extras</span>
                <span className="text-xl font-bold text-blue-500">
                  + {formatMoneyNumber(totalExtras)}
                </span>
              </div>
            )}
            <div className={style.totalItem}>
              <span className={style.totalLabel}>
                <AttachMoneyIcon fontSize="small" /> Valor Total Cliente
              </span>
              <span className={style.totalValue}>
                {formatMoneyNumber(revestimientoInfo.valorTotal)}
              </span>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button label="Cerrar" onClick={handleClose} variant="primary" />
      </Modal.Footer>
    </Modal>
  );
};

export default InfoRevestimientoDialog;
