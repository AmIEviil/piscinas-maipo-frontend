import type { IUploadedFile } from "../../../service/UploadedFiles.interface";
import DownloadIcon from "../../ui/Icons/DownloadIcon";

interface DownloadFileProps {
  file: IUploadedFile;
}

const DownloadFile = ({ file }: DownloadFileProps) => {
  const handleDownload = (url: string) => {
    window.open(url, "_blank");
  };
  return (
    <div
      key={file.id}
      className="col-md-4"
      style={{ display: "flex", alignItems: "center" }}
    >
      {/* 1. Nombre del archivo: Puede ser un link simple o solo texto */}
      <a
        href={file.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        {file.filename}
      </a>

      {/* 2. Botón de descarga: Separado del link para evitar conflictos */}
      <button
        onClick={() => handleDownload(file.url)}
        style={{
          border: "none",
          background: "none",
          marginLeft: "8px",
          cursor: "pointer", // Importante para UX
          padding: "4px", // Un poco de área de click
        }}
        title="Descargar archivo" // Accesibilidad
        aria-label={`Descargar ${file.filename}`}
      >
        <DownloadIcon />
      </button>
    </div>
  );
};

export default DownloadFile;
