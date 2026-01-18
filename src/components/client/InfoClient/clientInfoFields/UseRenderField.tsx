/* eslint-disable @typescript-eslint/no-explicit-any */
import style from "./ClientsInfoFields.module.css";
import { formatDateToDDMMYYYY } from "../../../../utils/DateUtils";
import {
  formatMoneyNumber,
  toUpperCaseFirstLetter,
} from "../../../../utils/formatTextUtils";
import { useEffect, useState } from "react";
import {
  handleTypeOfField,
  handleWidthByInput,
} from "../../../../utils/formUtils";
import type { IOptionsSelect } from "../../../ui/Select/Select";
import CheckIcon from "../../../ui/Icons/CheckIcon";
import CloseIcon from "../../../ui/Icons/CloseIcon";
import PencilIcon from "../../../ui/Icons/PencilIcon";
import MultiSelectDropdown from "../../../ui/dropdown/MultipleSelectDropdown";

interface Field {
  key: string;
  value: any;
}

interface RenderFieldProps {
  field: Field;
  // commentable?: boolean;
  options?: IOptionsSelect[];
  // comments?: IObservacion[];
  multiple?: boolean;
  multiCheckbox?: boolean;
  // rawValue?: string | number | null;
  onEdit?: (value: string | number | null | undefined) => void;
  // isAddingField?: boolean;
  // onComment?: (value: string) => void;
}

export const RenderItemField = ({
  field,
  options = [],
  // comments,
  multiple,
  multiCheckbox,
  onEdit,
}: // onComment,
RenderFieldProps) => {
  const [hover, setHover] = useState(false);
  const [enableEdit, setEnableEdit] = useState(false);
  // const [enableComment, setEnableComment] = useState(false);

  const [editedValue, setEditedValue] = useState<
    string | number | null | undefined
  >(field.value);

  const type = handleTypeOfField(field.value);

  const hasChanges = editedValue !== field.value;

  useEffect(() => {
    setEditedValue(field.value);
  }, [field.value]);

  // useEffect(() => {
  //   // Si es multiCheckbox preferimos rawValue (string db como "0,1") si está disponible
  //   if (multiCheckbox) {
  //     if (
  //       rawValue !== undefined &&
  //       rawValue !== null &&
  //       String(rawValue) !== ""
  //     ) {
  //       setEditedValue(String(rawValue));
  //       return;
  //     }
  //     // fallback: value viene como labels => convertir a values
  //     if (typeof field.value === "string") {
  //       const parsed = parseLabelsToValues(field.value, options);
  //       setEditedValue(parsed);
  //       return;
  //     }
  //     setEditedValue("");
  //     return;
  //   }
  //   if (field.value !== editedValue) {
  //     setEditedValue(field.value);
  //   }
  // }, [field.value, rawValue, options, multiCheckbox]);

  // const handleVisibleField = (field: Field) => {
  //   const value = field.value;
  //   if (value === null || value === undefined) return false;
  //   if (typeof value === "string" && value.trim() === "") return false;
  //   if (Array.isArray(value) && value.length === 0) return false;
  //   if (typeof value === "object" && Object.keys(value).length === 0)
  //     return false;
  //   return true;
  // };

  const handleFieldDisplay = () => {
    if (field.key.includes("valor")) {
      return formatMoneyNumber(field.value);
    }
    if (field.key.includes("fecha")) {
      return formatDateToDDMMYYYY(field.value);
    }
    return field.value;
  };

  // if (!handleVisibleField(field)) return null;

  // const handleClickComment = () => {
  //   setEnableComment(!enableComment);
  // };

  const handleClickEdit = () => {
    setEnableEdit(true);
  };

  const handleCancelEdit = () => {
    setEnableEdit(false);
  };

  const handleConfirmEdit = () => {
    if (onEdit && editedValue !== field.value) {
      onEdit(editedValue);
    }
    handleCancelEdit();
  };

  const handleHover = (value: boolean) => {
    if (!enableEdit) {
      setHover(value);
    }
  };

  return (
    <div
      className={style.labelItemContainer}
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
    >
      {/* Label + Value OR Edit Mode */}
      <div className="flex items-center justify-center ">
        <span className={style.labelItem}>
          <span className="font-semibold">
            {toUpperCaseFirstLetter(field.key)}:{" "}
          </span>
          {!enableEdit ? (
            <>{handleFieldDisplay()}</>
          ) : (
            <span
              className={`flex flex-inline justify-between  w-[${handleWidthByInput(
                editedValue,
              )}%]! ${style.inputEditField}`}
            >
              <div className="flex flex-row justify-between w-full gap-2">
                <div className="flex flex-row flex-wrap gap-4 items-center w-full justify-start">
                  {options && options.length > 0 && (
                    <>
                      {multiple ? (
                        <MultiSelectDropdown
                          options={options}
                          value={String(editedValue)}
                          onSelect={(value) => setEditedValue(value)}
                          arrowType="arrow"
                        />
                      ) : multiCheckbox ? (
                        options?.map((option) => {
                          const currentValues = editedValue
                            ? String(editedValue).split(",")
                            : [];
                          const isChecked = currentValues.includes(
                            String(option.value),
                          );

                          return (
                            <div
                              key={option.value}
                              className="flex flex-row justify-items-start items-center"
                            >
                              <input
                                id={`${field.key}-${option.value}`}
                                type="checkbox"
                                name={toUpperCaseFirstLetter(field.key)}
                                value={option.value}
                                checked={isChecked}
                                onChange={(e) => {
                                  let newValues = [...currentValues];
                                  if (e.target.checked) {
                                    if (
                                      !newValues.includes(String(option.value))
                                    ) {
                                      newValues.push(String(option.value));
                                    }
                                  } else {
                                    newValues = newValues.filter(
                                      (val) => val !== String(option.value),
                                    );
                                  }
                                  setEditedValue(newValues.join(","));
                                }}
                              />
                              <label
                                htmlFor={`${toUpperCaseFirstLetter(
                                  field.key,
                                )}-${option.value}`}
                                className="ml-2"
                              >
                                {option.label}
                              </label>
                            </div>
                          );
                        })
                      ) : (
                        options.map((option) => (
                          <div
                            key={option.value}
                            className="flex flex-row justify-items-start items-center"
                          >
                            <input
                              id={`${toUpperCaseFirstLetter(field.key)}-${
                                option.value
                              }`}
                              type="radio"
                              name={toUpperCaseFirstLetter(field.key)}
                              value={option.value ?? ""}
                              checked={Boolean(editedValue)}
                              onChange={(e) => setEditedValue(e.target.value)}
                            />
                            <label
                              htmlFor={`${toUpperCaseFirstLetter(field.key)}-${
                                option.value
                              }`}
                              className="ml-2"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))
                      )}
                    </>
                  )}
                  {options?.length === 0 && type === "string" && (
                    <>
                      <input
                        className="border border-gray-300 rounded-md p-2 w-full"
                        type="text"
                        value={String(editedValue)}
                        onChange={(e) => {
                          setEditedValue(e.target.value);
                        }}
                      />
                    </>
                  )}
                  {options?.length === 0 && type === "number" && (
                    <input
                      className="border border-gray-300 rounded-md p-2 w-full"
                      type="number"
                      value={String(editedValue)}
                      onChange={(e) => setEditedValue(e.target.value)}
                    />
                  )}
                  {options?.length === 0 && type === "hour" && (
                    <input
                      className="border border-gray-300 rounded-md p-2"
                      type="time"
                      value={String(editedValue)}
                      onChange={(e) => {
                        const newHour = e.target.value; // "10:30"
                        // reconstruyes la fecha original con la nueva hora
                        setEditedValue(() => newHour);
                      }}
                    />
                  )}
                  {options?.length === 0 && type === "date" && (
                    <input
                      className="border border-gray-300 rounded-md p-2"
                      type="date"
                      value={
                        editedValue
                          ? typeof editedValue === "string"
                            ? new Date(editedValue).toISOString().slice(0, 10)
                            : (() => {
                                // Parseamos el string "DD/MM/YYYY"
                                const parts = String(editedValue).split("/");
                                if (parts.length === 3) {
                                  const [day, month, year] = parts;
                                  const parsed = new Date(
                                    `${year}-${month.padStart(
                                      2,
                                      "0",
                                    )}-${day.padStart(2, "0")}`,
                                  );
                                  return parsed.toISOString().slice(0, 10);
                                }
                                return "";
                              })()
                          : ""
                      }
                      onChange={(e) => {
                        const [year, month, day] = e.target.value.split("-");
                        const localDate = new Date(
                          Number(year),
                          Number(month) - 1,
                          Number(day),
                        );
                        setEditedValue(localDate.getTime());
                      }}
                    />
                  )}
                  {options?.length === 0 && type === "text-area" && (
                    <textarea
                      className="border border-gray-300 rounded-md p-2 w-full custom-scrollbar"
                      value={String(editedValue)}
                      onChange={(e) => setEditedValue(e.target.value)}
                    />
                  )}
                  {options?.length === 0 && !type && <span>Sin opciones</span>}
                </div>
              </div>
            </span>
          )}
        </span>

        {/* Pencil icon only on hover and when NOT editing */}
        {!enableEdit && hover && (
          <button className="normal ml-2" onClick={() => handleClickEdit()}>
            <PencilIcon />
          </button>
        )}

        {/* Save button when editing */}
        {enableEdit && (
          <button
            className="normal ml-2 text-blue-600"
            onClick={() => handleConfirmEdit()}
          >
            {hasChanges ? (
              <CheckIcon size={28} color="black" />
            ) : (
              <CloseIcon size={24} color="black" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
