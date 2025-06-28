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
    if (onChange) {
      onChange(event);
    }
  };

  return (
    <div>
      <FormControl sx={{ m: 0.5, minWidth: 150, width: "100%" }}>
        <InputLabel
          className={`${style.customInputLabel} ${icon ? style.withIcon : ""}`}
          id="demo-simple-select"
          sx={{
            top: "-0.5rem",
            paddingLeft: icon ? "2rem" : "0rem",
            fontWeight: "500",
            "&.MuiInputLabel-shrink": {
              top: "-0.1rem",
              left: "0px",
            },
          }}
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
            style: {
              width: "1rem",
            },
          }}
          sx={{
            "& .MuiOutlinedInput-input": {
              margin: "0px",
              padding: "0.5rem",
            },
            "&.MuiInputLabel-root": {
              backgroundColor: "blue",
            },
            // MuiFormLabel-root-MuiInputLabel-root
            "& .MuiOutlinedInput-notchedOutline": {
              borderRadius: "24px",
              // backgroundColor: "red",
            },
            "& .MuiInputLabel-root": {
              top: "-0.5rem",
              backgroundColor: " red",
            },
            "& .MuiInputLabel-shrink": {
              top: "-0.1rem",
              backgroundColor: " blue",
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
