import React, { useEffect } from "react";
import UploadFileIcon from "../../ui/Icons/UploadFileIcon";
import FileIcon from "../../ui/Icons/FileIcon";
import TrashIcon from "../../ui/Icons/TrashIcon";

// Definimos una interfaz sólida para el objeto de archivo
export interface UploadedFileItem {
  id: string;
  file: File; // El archivo nativo (para enviar al backend)
  previewUrl: string; // Para previsualizar
  name: string;
  size: number;
}

interface UploadFileContainerProps {
  files: UploadedFileItem[];
  setFiles: (files: UploadedFileItem[]) => void;
  accept?: string; // Opcional: para limitar tipos (ej: ".pdf,.jpg")
  maxFiles?: number; // Opcional: límite de archivos
}

const UploadFileContainer = ({
  files,
  setFiles,
  accept = "*",
  maxFiles = 10,
}: UploadFileContainerProps) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;

    if (selectedFiles && selectedFiles.length > 0) {
      // Convertimos FileList a Array para poder usar map
      const newFilesArray = Array.from(selectedFiles);

      // Validamos si excede el máximo permitido
      if (files.length + newFilesArray.length > maxFiles) {
        alert(`No puedes subir más de ${maxFiles} archivos.`);
        return;
      }

      const newFilesMapped: UploadedFileItem[] = newFilesArray.map((file) => ({
        id: `${Date.now()}-${file.name}-${Math.random()}`, // ID único robusto
        file: file,
        name: file.name,
        size: file.size,
        previewUrl: URL.createObjectURL(file),
      }));

      // IMPORTANTE: Usamos spread operator (...) para mantener los anteriores y agregar los nuevos
      setFiles([...files, ...newFilesMapped]);
    }

    // Reseteamos el input para permitir subir el mismo archivo nuevamente si se borró
    event.target.value = "";
  };

  const handleRemoveFile = (idToRemove: string) => {
    // Revocar la URL del objeto para liberar memoria
    const fileToRemove = files.find((f) => f.id === idToRemove);
    if (fileToRemove?.previewUrl) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }

    // Actualizar estado filtrando el que se borra
    const updatedFiles = files.filter((file) => file.id !== idToRemove);
    setFiles(updatedFiles);
  };

  // Limpieza de memoria cuando el componente se desmonta
  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.previewUrl));
    };
  }, [files]);

  return (
    <div className="upload-container">
      {/* Botón de carga estilizado */}
      <div className="mb-3">
        <input
          type="file"
          onChange={handleFileChange}
          multiple // <--- CLAVE: Permite selección múltiple nativa
          id="fileInput"
          accept={accept}
          style={{ display: "none" }}
        />
        <label
          htmlFor="fileInput"
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px",
            border: "2px dashed #ccc",
            borderRadius: "8px",
            justifyContent: "center",
            color: "#666",
          }}
        >
          <UploadFileIcon />
          <span>Haga clic para adjuntar archivos</span>
        </label>
      </div>

      {/* Lista de archivos cargados */}
      {files.length > 0 && (
        <div
          className="file-list"
          style={{ display: "flex", flexDirection: "column", gap: "8px" }}
        >
          {files.map((file) => (
            <div
              key={file.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 12px",
                background: "#f8f9fa",
                borderRadius: "6px",
                border: "1px solid #eee",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  overflow: "hidden",
                }}
              >
                {/* Previsualización si es imagen, sino icono genérico */}
                {file.file.type.startsWith("image/") ? (
                  <img
                    src={file.previewUrl}
                    alt="preview"
                    style={{
                      width: "30px",
                      height: "30px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                ) : (
                  <FileIcon size={20} />
                )}

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "200px",
                    }}
                  >
                    {file.name}
                  </span>
                  <span style={{ fontSize: "11px", color: "#999" }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleRemoveFile(file.id)}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#dc3545",
                }}
                title="Eliminar archivo"
              >
                <TrashIcon size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadFileContainer;
