import type { IUploadedFile } from "../../../service/UploadedFiles.interface";
import Button from "../../ui/button/Button";
import DownloadIcon from "../../ui/Icons/DownloadIcon";
import EyeIcon from "../../ui/Icons/EyeIcon";
import style from "./ListPropuestas.module.css";

interface ListFilesPropuestasProps {
  files: IUploadedFile[];
  handleGeneratePropuesta?: () => void;
}

const ListFilesPropuestas = ({
  files,
  handleGeneratePropuesta,
}: ListFilesPropuestasProps) => {
  return (
    <div className={`${style.container} custom-scrollbar`}>
      <div className={style.header}>
        <span className={style.title}>Propuestas</span>
        <Button
          label="Nueva Propuesta PDF"
          variant="secondary"
          onClick={handleGeneratePropuesta}
        />
      </div>
      <div className={style.filesList}>
        {files.map((file) => (
          <span key={file.id} className={style.fileItem}>
            {file.filename}
            <div className="flex flex-row gap-2">
              <Button
                variant="tertiary"
                icon={<EyeIcon skipClick />}
                onClick={() => window.open(file.url)}
                iconPosition="only"
                className="p-1 m-0"
              />
              <Button
                variant="tertiary"
                icon={<DownloadIcon />}
                onClick={() => window.open(file.url)}
                iconPosition="only"
                className="p-1 m-0"
              />
            </div>
          </span>
        ))}
      </div>
    </div>
  );
};
export default ListFilesPropuestas;
