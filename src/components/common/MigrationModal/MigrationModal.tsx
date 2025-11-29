import Modal from "react-bootstrap/Modal";
import "./MigrationModal.css";
import InfoIcon from "../../ui/Icons/InfoIcon";
import CopyIcon from "../../ui/Icons/CopyIcon";

interface MigrationModalProps {
  visible: boolean;
  centered?: boolean;
  onClose: () => void;
}

const MigrationModal = ({
  visible,
  centered = true,
  onClose,
}: MigrationModalProps) => {
  return (
    <Modal
      show={visible}
      animation={false}
      centered={centered}
      dialogClassName={`migration-modal`}
      onHide={onClose}
      size="lg"
    >
      <Modal.Header closeButton className={`migration-modal-header`}>
        <InfoIcon size={32} />
        <Modal.Title className="ml-2">
          Información para crear migraciones
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="migration-modal-body">
          <span className="font-bold">Pasos para crear una migración:</span>
          <ul className="list-disc list-inside mt-2 text-lg text-gray-700">
            <li>
              Crear un nuevo archivo de migración en el backend con el siguiente
              comando:
              <pre className="mt-2 bg-gray-100 p-2 rounded">
                <code className="text-sm justify-between w-full flex items-center">
                  yarn migration:create
                  src/migrations/&lt;nombre_de_la_migración&gt;
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        "yarn migration:create src/migrations/<nombre_de_la_migración>"
                      );
                      alert("Comando copiado al portapapeles");
                    }}
                  >
                    <CopyIcon />
                  </button>
                </code>
              </pre>
            </li>
            <li>
              Definir la estructura de la migración en el archivo creado, este
              por defecto viene con el método up y down.
            </li>
            <li>
              Implementar código SQL en los métodos up y down.
              <br />
              Ejemplo:
              <pre className="mt-2 bg-gray-100 p-2 rounded">
                <code>
                  insert into users (name, email) values ('Nuevo Usuario')
                </code>
              </pre>
              <span className="text-sm text-gray-500">
                (El método up se ejecuta al aplicar la migración y el método
                down al revertirla)
              </span>
            </li>
            <li>
              Probar la migración en un entorno de desarrollo. Idealmente desde
              esta página.
              <br />
              <span className="text-sm text-gray-500">
                (Puedes usar los comandos en la consola del backend{" "}
                <code>yarn migration:run</code> o{" "}
                <code>yarn migration:revert</code>)
              </span>
            </li>
            <li>
              Ejecutar la migración en el entorno de producción y cruzar los
              dedos.
            </li>
          </ul>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default MigrationModal;
