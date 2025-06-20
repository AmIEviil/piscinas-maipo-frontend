import { LOGIN_API } from "../api/login/api";
import apiClient from "../client/client";

export const userService = {
  getUsers: async (): Promise<unknown> => {
    const response = await apiClient.get(LOGIN_API.users);
    return response.data;
  },
};
