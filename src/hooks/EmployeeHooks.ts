import { useMutation } from "@tanstack/react-query";
import { useRefetchStore } from "../store/refetchStore";
import { employeeService } from "../core/services/EmployeeService";
import { useSnackbar } from "../utils/snackBarHooks";
import type { IEmployee } from "../service/employee.interface";

export const useEmployee = () => {
  const setShouldRefetch = useRefetchStore((state) => state.setShouldRefetch);
  const employeeMutation = useMutation({
    mutationFn: employeeService.getEmployees,
    onSuccess: () => {
      setShouldRefetch(false);
    },
  });
  return employeeMutation;
};

export const useEmployeeById = () => {
  const setShouldRefetch = useRefetchStore((state) => state.setShouldRefetch);
  const employeeByIdMutation = useMutation({
    mutationFn: employeeService.getEmployeeById,
    onSuccess: () => {
      setShouldRefetch(false);
    },
  });
  return employeeByIdMutation;
};

export const useCreateEmployee = () => {
  const setShouldRefetch = useRefetchStore((state) => state.setShouldRefetch);
  const { showSnackbar } = useSnackbar();
  const createEmployeeMutation = useMutation({
    mutationFn: employeeService.createEmployee,
    onSuccess: () => {
      setShouldRefetch(true);
      showSnackbar("Empleado creado exitosamente", "success");
    },
  });
  return createEmployeeMutation;
};
export const useUpdateEmployee = () => {
  const setShouldRefetch = useRefetchStore((state) => state.setShouldRefetch);
  const { showSnackbar } = useSnackbar();
  const updateEmployeeMutation = useMutation({
    mutationFn: ({
      employeeId,
      employeeData,
    }: {
      employeeId: string;
      employeeData: Partial<IEmployee>;
    }) => employeeService.updateEmployee(employeeId, employeeData),
    onSuccess: () => {
      setShouldRefetch(true);
      showSnackbar("Empleado actualizado exitosamente", "success");
    },
  });
  return updateEmployeeMutation;
};

export const useDeleteEmployee = () => {
  const setShouldRefetch = useRefetchStore((state) => state.setShouldRefetch);
  const { showSnackbar } = useSnackbar();
  const deleteEmployeeMutation = useMutation({
    mutationFn: (employeeId: string) =>
      employeeService.deleteEmployee(employeeId),
    onSuccess: () => {
      setShouldRefetch(true);
      showSnackbar("Empleado eliminado exitosamente", "success");
    },
  });
  return deleteEmployeeMutation;
};
