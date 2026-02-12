import style from "./ComprobantesContainer.module.css";
import { useEffect, useRef, useState } from "react";
import type { IComprobantePago } from "../../../../service/ComprobantePagos.interface";
import Button from "../../../ui/button/Button";
import TrashIcon from "../../../ui/Icons/TrashIcon";
import { useModalStore } from "../../../../store/ModalStore";
import MediaVisualizer from "../../../ui/modal/mediaVisualizer/MediaVisualizer";
import { useDeleteComprobantePago } from "../../../../hooks/ComprobantePagosHooks";
import CaretIcon from "../../../ui/Icons/CaretIcon";
import Calendar from "../../../ui/datepicker/DatePicker";
import { formatDateToLocalString } from "../../../../utils/DateUtils";
import CustomInputText from "../../../ui/InputText/CustomInputText";
import TableGeneric from "../../../ui/table/Table";
import { titlesComprobantesTable } from "../../../../constant/constantBodyClient";
import { ActionsTdTable } from "../../../common/ActionsTable/ActionsTable";
import { toUpperCaseFirstLetter } from "../../../../utils/formatTextUtils";

interface ComprobantesContainerProps {
  comprobantesData?: IComprobantePago[];
  onApprove?: (data: {
    monto: number;
    fecha_pago: string;
    comprobante?: File;
  }) => void;
}
const ComprobantesContainer = ({
  comprobantesData,
  onApprove,
}: ComprobantesContainerProps) => {
  const deleteComprobantePagoMutation = useDeleteComprobantePago();
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);

  // States
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showComprobantes, setShowComprobantes] = useState(false);
  const [isAddingNewComprobante, setIsAddingNewComprobante] = useState(false);
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [pagoData, setPagoData] = useState<{
    monto: number;
    fecha_pago: string;
  } | null>(null);
  const [isReadyToUpload, setIsReadyToUpload] = useState(false);
  const [isReadyToCreate, setIsReadyToCreate] = useState(false);

  const handlePriceChange = (value: string) => {
    const numeric = value.replace(/[^\d]/g, "");
    setPagoData({
      monto: numeric ? Number(numeric) : 0,
      fecha_pago: pagoData?.fecha_pago ?? "",
    });
  };

  const handleApprove = () => {
    if (onApprove && pagoData) {
      onApprove({
        monto: pagoData.monto,
        fecha_pago: pagoData.fecha_pago,
        comprobante: comprobante || undefined,
      });
      setIsAddingNewComprobante(false);
      setComprobante(null);
      setIsReadyToUpload(false);
      setPagoData(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddComprobante = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setComprobante(file);

    // Pequeño delay para que la transición se note
    setTimeout(() => {
      setIsReadyToUpload(true);
    }, 100);
  };

  const handleDeleteComprobante = () => {
    setComprobante(null);
    setIsReadyToUpload(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleViewComprobante = (comp: IComprobantePago) => {
    openModal({
      header: ModalContent(comp).headerContent,
      content: ModalContent(comp).bodyContent,
    });
  };

  const onDeleteComprobante = (id: string) => {
    openModal({
      dialogClassName: "max-w-md! max-h-md!",
      header: <b className="text-header-modal">Confirmar eliminación</b>,
      content: (
        <div className="flex flex-col gap-4">
          <span>¿Estás seguro de que deseas eliminar este comprobante?</span>
        </div>
      ),
      footer: (
        <>
          <Button label="Cancelar" onClick={closeModal} />
          <Button
            label="Confirmar"
            onClick={() => handleDeleteExistingComprobante(id)}
          />
        </>
      ),
    });
  };

  const handleDeleteExistingComprobante = async (id: string) => {
    try {
      await deleteComprobantePagoMutation.mutateAsync(id);
      closeModal();
    } catch (error) {
      console.error("Error al eliminar el comprobante:", error);
    }
  };

  useEffect(() => {
    if (pagoData && pagoData.monto > 0 && pagoData.fecha_pago) {
      setIsReadyToCreate(true);
    } else {
      setIsReadyToCreate(false);
    }
  }, [comprobante, pagoData]);

  return (
    <div className="w-full flex flex-col items-start mt-4">
      <button
        className="normal p-2! text-sm  hover:text-white! flex flex-row items-center gap-2"
        onClick={() => setShowComprobantes((prev) => !prev)}
      >
        {showComprobantes ? "Ocultar comprobantes" : "Mostrar comprobantes"}
        <CaretIcon direction={showComprobantes ? "up" : "down"} />
      </button>
      <div
        className={style.comprobantesContainer}
        style={{
          display: showComprobantes ? "flex" : "none",
        }}
      >
        {comprobantesData && comprobantesData.length > 0 && (
          <div className="flex flex-col w-full">
            <span className="font-medium mb-2">Comprobantes cargados:</span>
            <TableGeneric
              titles={titlesComprobantesTable}
              data={comprobantesData}
              renderRow={(com) => (
                <tr>
                  <td className="min-w-[450px]">
                    {toUpperCaseFirstLetter(com.nombre)}
                  </td>
                  <td className="min-w-[100px]">
                    {toUpperCaseFirstLetter(com.tipo)}
                  </td>
                  <td>{new Date(com.fecha_emision).toLocaleDateString()}</td>
                  <td>
                    {new Intl.NumberFormat("es-CL", {
                      style: "currency",
                      currency: "CLP",
                      minimumFractionDigits: 0,
                    }).format(com?.monto || 0)}
                  </td>
                  <td className="">
                    {com.viewUrl && com.fileInfo && (
                      <ActionsTdTable
                        buttonClassName="normal p-1!"
                        onViewTooltip="Ver Comprobante"
                        onView={() => handleViewComprobante(com)}
                        onDeleteTooltip="Eliminar Comprobante"
                        onDelete={() => onDeleteComprobante(com.id)}
                        onDownloadTooltip="Descargar Comprobante"
                        onDownload={() =>
                          window.open(com.fileInfo.driveUrl, "_blank")
                        }
                      />
                    )}
                  </td>
                </tr>
              )}
            />
          </div>
        )}
        {!comprobantesData ||
        (comprobantesData.length === 0 && !isAddingNewComprobante) ? (
          <span className="text-sm text-gray-600">
            No hay comprobantes cargados.
          </span>
        ) : null}

        <div className="flex justify-end w-full items-center">
          {isAddingNewComprobante && (
            <div className="flex flex-row items-center gap-4 w-full ">
              <Calendar
                title="Fecha de Pago"
                required
                mode="day"
                initialValue={
                  pagoData?.fecha_pago
                    ? new Date(`${pagoData?.fecha_pago}T00:00:00`)
                    : null
                }
                onChange={({ start }) =>
                  setPagoData({
                    monto: pagoData?.monto ?? 0,
                    fecha_pago: start
                      ? formatDateToLocalString(start)
                      : (pagoData?.fecha_pago ?? ""),
                  })
                }
              />
              <CustomInputText
                title="Monto"
                require
                type="text"
                value={
                  pagoData?.monto
                    ? new Intl.NumberFormat("es-CL", {
                        style: "currency",
                        currency: "CLP",
                        minimumFractionDigits: 0,
                      }).format(pagoData.monto)
                    : ""
                }
                onChange={handlePriceChange}
              />
              {comprobante && (
                <div className="ml-2 flex items-center gap-2 border-gray-300 rounded-md p-2 bg-gray-100">
                  <span className="text-sm text-gray-600 mt-1">
                    Archivo seleccionado: <p>{comprobante.name}</p>
                  </span>
                  <Button
                    icon={<TrashIcon />}
                    iconPosition="only"
                    className="p-2"
                    onClick={handleDeleteComprobante}
                  />
                </div>
              )}
              <div className="flex flex-col items-center gap-2">
                <strong>Agregar Archivo</strong>
                <Button
                  label={isReadyToUpload ? "Agregar Archivo" : "Subir archivo"}
                  onClick={
                    isReadyToUpload ? handleApprove : handleAddComprobante
                  }
                  className={`
                h-fit!
                transition-all!
                duration-300!
                ease-in-out!
                ${isReadyToUpload ? "bg-green-600! hover:bg-green-700!" : ""}
                  `}
                />
              </div>
            </div>
          )}
          <Button
            label={isAddingNewComprobante ? "Cancelar" : "Agregar comprobante"}
            variant="secondary"
            onClick={
              isAddingNewComprobante
                ? () => setIsAddingNewComprobante(false)
                : () => setIsAddingNewComprobante(true)
            }
            className={`
                h-fit!
                transition-all!
                duration-300!
                ease-in-out!
                
            `}
          />
          {isAddingNewComprobante && (
            <Button
              label="Confirmar"
              onClick={handleApprove}
              className={`
                h-fit!
                transition-all!
                duration-300!
                ease-in-out!
            `}
              variant="primary"
              disabled={!isReadyToCreate}
            />
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ComprobantesContainer;

const mapComprobante = (comprobante: IComprobantePago) => {
  const isImage = comprobante.fileInfo.mimeType.startsWith("image/");
  const isPdf = comprobante.fileInfo.mimeType === "application/pdf";
  // Consideramos video cualquier cosa que empiece con video/
  const isVideo = comprobante.fileInfo.mimeType.startsWith("video/");

  let resourceUrl = "";
  let kind = "other";

  if (isImage) {
    kind = "img";
    resourceUrl = `https://lh3.googleusercontent.com/d/${comprobante.fileId}`;
  } else if (isPdf || isVideo) {
    kind = "iframe";
    resourceUrl = comprobante.viewUrl;
  }

  return {
    _kind: kind,
    url: resourceUrl,
    name: comprobante.nombre,
  };
};

const ModalContent = (comprobante: IComprobantePago) => {
  const headerContent = (
    <b className="text-header-modal">Visualizando: {comprobante.nombre}</b>
  );
  const bodyContent = (
    <div className="w-full h-full flex justify-center items-center">
      <MediaVisualizer
        currentMedia={mapComprobante(comprobante)}
        fullScreenImage={true}
      />
    </div>
  );
  return { headerContent, bodyContent };
};
