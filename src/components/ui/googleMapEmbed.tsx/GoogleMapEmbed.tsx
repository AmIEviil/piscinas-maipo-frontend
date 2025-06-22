import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  lat: number;
  lng: number;
  zoom?: number;
  height?: string;
  width?: string;
}

const MapFromCoords = ({
  lat,
  lng,
  zoom = 16,
  height = "450px",
  width = "100%",
}: Props) => {
  const isCoordsValid = lat !== 0 && lng !== 0;

  if (!isCoordsValid) {
    return (
      <div
        style={{
          height,
          width,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f2f2f2",
          borderRadius: "8px",
        }}
      >
        <p style={{ color: "#888" }}>Cargando mapa...</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      style={{
        height,
        width,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f2f2f2",
        borderRadius: "8px",
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[lat, lng]}>
        <Popup>Ubicación del cliente</Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapFromCoords;
