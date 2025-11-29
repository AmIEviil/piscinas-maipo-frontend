import type {
  CreateUser,
  CreateUserResponse,
  UpdateUser,
  User,
} from "../../service/usuariosInterface";
import { USER_API } from "../api/users/api";
import apiClient from "../client/client";

export const usuariosService = {
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get(USER_API.users);
    return response.data;
  },
  getUserById: async (id: string): Promise<User> => {
    const url = USER_API.userId.replace(":id", id.toString());
    const response = await apiClient.get(url);
    return response.data;
  },
  createNewUser: async (data: CreateUser): Promise<CreateUserResponse> => {
    const response = await apiClient.post<CreateUserResponse>(
      USER_API.createUser,
      data
    );
    return response.data;
  },
  updateUser: async (id: string, data: UpdateUser): Promise<User> => {
    const url = USER_API.updateUser.replace(":id", id.toString());
    const response = await apiClient.put<User>(url, data);
    return response.data;
  },
  deleteUser: async (id: string): Promise<{ message: string }> => {
    const url = USER_API.deleteUser.replace(":id", id.toString());
    const response = await apiClient.delete(url);
    return response.data;
  },
};
