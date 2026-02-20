import BodyClients from "../../components/client/BodyClients/BodyClients";
import BoletaModalContainer from "../../components/client/InfoClient/comprobantesContainer/BoletaModalContainer";

export const ClientsView = () => {
  return (
    <div>
      <span className="text-white">Clientes</span>
      <BodyClients />
      <BoletaModalContainer />
      
    </div>
  );
};
