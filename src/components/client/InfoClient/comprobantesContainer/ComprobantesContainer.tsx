import { useRef, useState } from "react";
import type { IComprobantePago } from "../../../../service/ComprobantePagos.interface";
import Button from "../../../ui/button/Button";
import TrashIcon from "../../../ui/Icons/TrashIcon";
import EyeIcon from "../../../ui/Icons/EyeIcon";
import { useModalStore } from "../../../../store/ModalStore";
import MediaVisualizer from "../../../ui/modal/mediaVisualizer/MediaVisualizer";

interface ComprobantesContainerProps {
  comprobantesData?: IComprobantePago[];
  onApprove?: (comprobante: File) => void;
}
const ComprobantesContainer = ({
  comprobantesData,
  onApprove,
}: ComprobantesContainerProps) => {
  const openModal = useModalStore((state) => state.openModal);

  // States
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [isReadyToUpload, setIsReadyToUpload] = useState(false);

  const handleApprove = () => {
    if (onApprove && comprobante) {
      onApprove(comprobante);
      setComprobante(null);
      setIsReadyToUpload(false);
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
    openModal(ModalContent(comp).headerContent, ModalContent(comp).bodyContent);
  };

  return (
    <div>
      <div className="flex flex-row w-full mt-4 mb-2 gap-4 items-center">
        {comprobantesData && comprobantesData.length > 0 && (
          <div className="flex flex-col">
            <span className="font-medium mb-2">Comprobantes cargados:</span>
            <ul className=" list-inside max-h-40 overflow-y-auto custom-scrollbar border p-2 rounded-md bg-gray-50">
              {comprobantesData.map((comp) => (
                <li
                  key={comp.id}
                  className="text-sm text-gray-700 flex justify-between items-center mb-1 gap-2"
                >
                  {comp.nombre}
                  <Button
                    icon={<EyeIcon size={24} skipClick />}
                    iconPosition="only"
                    className="p-1"
                    onClick={() => handleViewComprobante(comp)}
                  />
                  <Button
                    icon={<TrashIcon />}
                    iconPosition="only"
                    className="p-1"
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
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
        <div className="flex justify-end w-full">
          <Button
            label={
              isReadyToUpload ? "Subir comprobante" : "Agregar comprobante"
            }
            onClick={isReadyToUpload ? handleApprove : handleAddComprobante}
            className={`
                h-fit!
                transition-all!
                duration-300!
                ease-in-out!
                ${isReadyToUpload ? "bg-green-600! hover:bg-green-700!" : ""}
            `}
          />
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
  console.log("Mapping Comprobante:", comprobante);

  const isImage = comprobante.fileInfo.mimeType.startsWith("image/");
  const isPdf = comprobante.fileInfo.mimeType === "application/pdf";
  // Consideramos video cualquier cosa que empiece con video/
  const isVideo = comprobante.fileInfo.mimeType.startsWith("video/");

  let resourceUrl = "";
  let kind = "other"; // Default para iframe

  if (isImage) {
    kind = "img";
    // TRUCO: Usamos el ID para crear un link de visualización directa
    // O podrías usar: comprobante.fileInfo.driveUrl.replace("export=download", "export=view")
    resourceUrl = `https://drive.google.com/uc?export=view&id=${comprobante.fileId}`;
  } else if (isPdf || isVideo) {
    // Para PDF y VIDEO usamos el visualizador de Google (iframe)
    kind = "iframe";
    resourceUrl = comprobante.viewUrl; // https://drive.google.com/file/d/.../preview
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
