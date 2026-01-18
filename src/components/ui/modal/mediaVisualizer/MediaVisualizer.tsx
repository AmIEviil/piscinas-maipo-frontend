import { useRef } from "react";
// import { useTranslation } from "react-i18next";
import style from "../CustomModal.module.css";

interface MediaVisualizerProps {
  currentMedia: {
    _kind: string;
    url: string;
    name: string;
  };
  fullScreenImage?: boolean;
}

const MediaVisualizer: React.FC<MediaVisualizerProps> = ({
  currentMedia,
  fullScreenImage,
}) => {
  //   const { t } = useTranslation();
  const mediaRef = useRef<HTMLImageElement>(null);

  console.log("Visualizando:", currentMedia);

  if (currentMedia._kind === "img") {
    return (
      <img
        ref={mediaRef}
        src={currentMedia.url}
        alt={currentMedia.name}
        className={fullScreenImage ? style.imageFull : style.image}
        loading="lazy"
        onError={(e) => {
          // Fallback por si falla la carga
          e.currentTarget.src = "ruta/a/imagen/por_defecto.png";
        }}
      />
    );
  }

  return (
    <iframe
      src={currentMedia.url}
      title={currentMedia.name}
      width="100%"
      height="100%"
      allow="autoplay; fullscreen"
      className="rounded-md border-none"
      style={{ minHeight: "500px" }}
    />
  );
};

export default MediaVisualizer;
