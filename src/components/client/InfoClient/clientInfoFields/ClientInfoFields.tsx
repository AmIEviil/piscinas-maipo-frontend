/* eslint-disable @typescript-eslint/no-explicit-any */
import GoogleMapFromAddress from "../../../ui/googleMapEmbed.tsx/GoogleMapEmbed";
import { DialogTitle } from "@mui/material";
import { useEffect, useState } from "react";
import CustomInputText from "../../../ui/InputText/CustomInputText";
import PencilIcon from "../../../ui/Icons/PencilIcon";
import CaretIcon from "../../../ui/Icons/CaretIcon";
import { toUpperCaseFirstLetter } from "../../../../utils/formatTextUtils";
import style from "./ClientsInfoFields.module.css";
import { getWindowWidth } from "../../../../utils/WindowUtils";
import { RenderItemField } from "./UseRenderField";
import { useChangeFieldValue } from "../../../../utils/formUtils";
import CheckIcon from "../../../ui/Icons/CheckIcon";
import CustomDropmenuV2 from "../../../ui/customdropmenu/CustomDropmenuV2";
import CloseIcon from "../../../ui/Icons/CloseIcon";
import { useClientResumenMonthStore } from "../../../../store/ClientStore";

export interface IClientForm {
  [key: string]: {
    key: string;
    value: any;
    type: string;
  };
}

interface Field {
  key: string;
  value: any;
}

interface ClientFieldsProps {
  clientInfo: IClientForm;
  coordenadas: { lat: number; lng: number } | undefined;
}

const ClientFields = ({ clientInfo, coordenadas }: ClientFieldsProps) => {
  const setModalVisible = useClientResumenMonthStore(
    (state) => state.openModal,
  );
  const [windowWidth, setWindowWidth] = useState(getWindowWidth());
  const [showClientInfo, setShowClientInfo] = useState(windowWidth > 720);
  const [editTitle, setEditTitle] = useState(false);
  const [addingFields, setAddingFields] = useState(false);
  const [addingField, setAddingField] = useState<{
    key: string;
    type: string;
    value: any;
  } | null>(null);

  const [clientInfoState, setClientInfoState] = useState<
    IClientForm | undefined
  >(clientInfo);

  const { handleUpdate } = useChangeFieldValue(clientInfo.id.value);

  const fieldsHeaderKeys = ["nombre", "direccion", "comuna"];
  const fieldsBodyKeys = [
    "dia_mantencion",
    "valor_mantencion",
    "tipo_piscina",
    "email",
    "fecha_ingreso",
    "telefono",
    "ruta",
    "isActive",
  ];

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Limpieza al desmontar
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleVisibleField = (field: Field) => {
    const value = field.value;
    if (value === null || value === undefined) return false;
    if (typeof value === "string" && value.trim() === "") return false;
    if (Array.isArray(value) && value.length === 0) return false;
    if (typeof value === "boolean") return false;
    if (typeof value === "object" && Object.keys(value).length === 0)
      return false;
    return true;
  };

  const headerTitleString = fieldsHeaderKeys
    .map((key) => clientInfo[key]?.value)
    .join(" - ");

  const headerFields = fieldsHeaderKeys.map((key) => clientInfo[key]);
  const bodyFields = fieldsBodyKeys.map((key) => clientInfo[key]);

  const visibleBodyFields = bodyFields.filter((field) =>
    handleVisibleField(field),
  );

  const mapAvailableFields = clientInfoState
    ? Object.values(clientInfoState).filter(
        (field) => !handleVisibleField(field),
      )
    : [];

  const handleToggleEditTitle = () => {
    console.log("Toggling edit title...");
    const hasChanges = fieldsHeaderKeys.some((key) => {
      return clientInfoState?.[key]?.value !== clientInfo[key]?.value;
    });
    if (editTitle === true && hasChanges) {
      console.log("Updating header fields...");
      handleUpdate([
        {
          campo: "nombre",
          valor: clientInfoState?.["nombre"]?.value,
        },
        {
          campo: "direccion",
          valor: clientInfoState?.["direccion"]?.value,
        },
        {
          campo: "comuna",
          valor: clientInfoState?.["comuna"]?.value,
        },
      ]);
    }
    setEditTitle(!editTitle);
  };

  const handleOnClickField = (fieldKey: string) => {
    const fieldToAdd = mapAvailableFields.find(
      (field) => field.key === fieldKey,
    );

    if (!fieldToAdd) return;

    setAddingField({
      key: fieldToAdd.key,
      type: fieldToAdd.type,
      value: "",
    });
  };

  const mapMenuOptions = mapAvailableFields.map((field) => ({
    label: toUpperCaseFirstLetter(field.key),
    onClick: () => handleOnClickField(field.key),
  }));

  const handleShowDropdown = () => {
    if (addingFields && !addingField) return true;
    if (addingField) return false;
    return false;
  };

  return (
    <div className={style.clientInfoContainer}>
      <DialogTitle style={{ padding: 0 }}>
        <div className={style.titleContainer}>
          <div
            className="gap-4 flex"
            style={{ display: editTitle ? "flex" : "none" }}
          >
            {headerFields.map((field) => (
              <CustomInputText
                key={field.key}
                title={toUpperCaseFirstLetter(field.key)}
                value={clientInfoState?.[field.key]?.value || ""}
                onChange={(newValue) =>
                  setClientInfoState((prev) => ({
                    ...prev!,
                    [field.key]: {
                      ...prev![field.key],
                      value: newValue,
                    },
                  }))
                }
              />
            ))}
          </div>
          <span
            className={`${style.inputContainer}  ${
              editTitle ? "hidden" : "visible"
            }`}
          >
            {headerTitleString}
          </span>
          <button className="normal" onClick={() => handleToggleEditTitle()}>
            {editTitle ? <CheckIcon /> : <PencilIcon />}
          </button>
        </div>
      </DialogTitle>
      <div
        className="flex flex-row items-center text-center align-middle w-full gap-2 cursor-pointer"
        onClick={() =>
          windowWidth < 720 ? setShowClientInfo(!showClientInfo) : null
        }
      >
        <span className="font-medium ">Info Cliente</span>
        {windowWidth < 720 && (
          <span className="cursor-pointer">
            <CaretIcon direction="down" />
          </span>
        )}
      </div>
      <div className={style.detailsInfoContainer}>
        {showClientInfo && (
          <>
            <div className={style.labelsContainer}>
              {visibleBodyFields.map((field) => (
                <div key={field.key} className="w-fit">
                  <RenderItemField
                    field={clientInfoState?.[field.key] as any}
                    onEdit={(newValue) => {
                      setClientInfoState((prev) => ({
                        ...prev!,
                        [field.key]: {
                          ...prev![field.key],
                          value: newValue,
                        },
                      }));
                      handleUpdate([{ campo: field.key, valor: newValue }]);
                    }}
                  />
                </div>
              ))}
              {mapAvailableFields.length > 0 && (
                <div className="p-2.5 flex flex-row gap-2">
                  {handleShowDropdown() && (
                    <div className="mt-2 w-full">
                      <CustomDropmenuV2
                        options={mapMenuOptions}
                        icon={<CaretIcon direction="down" />}
                        label="Seleccionar campo"
                        typeClass="secondary"
                      />
                    </div>
                  )}
                  {!addingField && (
                    <button
                      className="normal"
                      onClick={() => {
                        setAddingFields(!addingFields);
                        setAddingField(null);
                      }}
                    >
                      <span>
                        {addingFields ? "Cancelar" : "Agregar campos"}
                      </span>
                    </button>
                  )}
                  {addingField && (
                    <div className="flex items-center gap-2 mt-2">
                      <CustomInputField
                        title={toUpperCaseFirstLetter(addingField.key)}
                        value={addingField.value}
                        onChange={(val: any) =>
                          setAddingField((prev) =>
                            prev ? { ...prev, value: val } : null,
                          )
                        }
                        onSave={() => {
                          setClientInfoState((prev) => ({
                            ...prev!,
                            [addingField.key]: {
                              key: addingField.key,
                              type: addingField.type,
                              value: addingField.value,
                            },
                          }));
                          handleUpdate([
                            {
                              campo: addingField.key,
                              valor: addingField.value,
                            },
                          ]);
                          setAddingField(null);
                          setAddingFields(false);
                        }}
                        onCancel={() => {
                          setAddingField(null);
                          setAddingFields(false);
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col justify-between flex-1">
              {windowWidth > 720 &&  (
                <div>
                  <button className="secondary" onClick={setModalVisible}>
                    Generar Boleta
                  </button>
                </div>
              )}
            </div>
          </>
        )}
        {windowWidth > 720 && (
          <div>
            <GoogleMapFromAddress
              lat={coordenadas?.lat ?? 0}
              lng={coordenadas?.lng ?? 0}
              width="300px"
              height="200px"
              zoom={200}
              coordenadas={coordenadas}
              googleUrlLink={`https://www.google.com/maps?q=${coordenadas?.lat},${coordenadas?.lng}`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientFields;

const CustomInputField = ({
  title,
  value,
  onChange,
  onSave,
  onCancel,
}: any) => {
  return (
    <div className={style.customInputContainer}>
      <div className="flex flex-col gap-1 w-full">
        <label className={style.inputLabel}>{title}</label>
        <input
          type="text"
          className={style.inputField}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <button
          className="normal"
          onClick={() => {
            onSave();
          }}
        >
          <CheckIcon />
        </button>
        <button className="normal" onClick={() => onCancel()}>
          <CloseIcon color="black" />
        </button>
      </div>
    </div>
  );
};
