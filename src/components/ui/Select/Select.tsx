import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { type SelectChangeEvent } from "@mui/material/Select";
import Select from "@mui/material/Select";
import style from "./SelectStyle.module.css";
import type { ReactNode } from "react";

interface CustomSelectProps {
  label?: string;
  options?: { value: string; label: string }[];
  value?: string;
  disabled?: boolean;
  onChange?: (event: SelectChangeEvent) => void;
  icon?: ReactNode;
}

const CustomSelect = ({
  label = "Soy un select",
  options,
  value,
  onChange,
  icon,
}: CustomSelectProps) => {
  const handleChange = (event: SelectChangeEvent) => {
    console.log(event);
    if (onChange) {
      onChange(event);
    }
  };

  return (
    <div>
      <FormControl sx={{ m: 1, minWidth: 220, width: "100%" }}>
        <InputLabel
          className={`${style.customInputLabel} ${icon ? style.withIcon : ""}`}
          id="demo-simple-select"
        >
          {icon && <span className={style.iconInputLabel}>{icon}</span>}
          <span className={style.InputLabel}>{label}</span>
        </InputLabel>
        <Select
          value={value}
          onChange={handleChange}
          label={label}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 200, // Ajusta a lo que necesites
                overflowY: "auto",
              },
            },
          }}
          sx={{
            "& .MuiOutlinedInput-input": {
              paddingLeft: "2rem",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderRadius: "24px",
            },
          }}
        >
          {options?.map((option, index) => (
            <MenuItem key={index} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default CustomSelect;
