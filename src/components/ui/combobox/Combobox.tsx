import { Combobox } from "@headlessui/react";
import { useTranslation } from "react-i18next";

interface MateriaOption {
  label: string;
  value: string;
}

interface Props {
  value: string;
  options: MateriaOption[];
  onChange: (value: string | null) => void;
}

export default function MateriaCombobox({
  value,
  options,
  onChange,
}: Props) {
  const { t } = useTranslation();

  const filteredOptions =
    value === ""
      ? options
      : options.filter((opt) =>
          opt.label.toLowerCase().includes(value.toLowerCase())
        );

  return (
    <Combobox value={value} onChange={onChange}>
      <div className="relative">
        <Combobox.Input
          className="border border-gray-300 p-2 rounded-sm w-full"
          placeholder="Seleccione o escriba una materia"
          onChange={(e) => onChange(e.target.value)}
          displayValue={(value: string | null) => value ?? ""}
        />

        <Combobox.Options className="absolute bg-white border border-gray-200 rounded-sm w-full mt-1 max-h-48 overflow-auto shadow-sm z-10">
          {filteredOptions.length === 0 && (
            <div className="p-2 text-gray-500 text-sm">
              {t("no_results.combobox.no_results", { searchTerm: value })}
            </div>
          )}

          {filteredOptions.map((opt) => (
            <Combobox.Option
              key={opt.value}
              value={opt.value}
              className="p-2 cursor-pointer hover:bg-gray-100"
            >
              {opt.label}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </div>
    </Combobox>
  );
}
