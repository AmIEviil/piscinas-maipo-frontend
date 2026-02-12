import type {
  FiltersEmployeesDto,
  IEmployee,
} from "../../service/employee.interface";
import { EMPLOYEE_API } from "../api/employee/api";

import apiClient from "../client/client";

export const employeeService = {
  getEmployees: async (filters?: FiltersEmployeesDto): Promise<IEmployee[]> => {
    const response = await apiClient.get(EMPLOYEE_API.employees, {
      params: filters,
    });
    return response.data;
  },
  getEmployeeById: async (employeeId: string): Promise<IEmployee> => {
    const endpoint = EMPLOYEE_API.employeesId.replace(":id", employeeId);
    const response = await apiClient.get(endpoint);
    return response.data;
  },
  createEmployee: async (employeeData: IEmployee): Promise<IEmployee> => {
    const response = await apiClient.post(EMPLOYEE_API.employees, employeeData);
    return response.data;
  },
  updateEmployee: async (
    employeeId: string,
    employeeData: Partial<IEmployee>,
  ): Promise<IEmployee> => {
    const endpoint = EMPLOYEE_API.employeesId.replace(":id", employeeId);
    const response = await apiClient.put(endpoint, employeeData);
    return response.data;
  },
  deleteEmployee: async (employeeId: string): Promise<void> => {
    const endpoint = EMPLOYEE_API.employeesId.replace(":id", employeeId);
    await apiClient.delete(endpoint);
  },
};
