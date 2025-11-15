import type {
  IAuthPayload,
  ILogoutResponse,
} from "../../service/authinterface";
import { AUTH_API } from "../api/auth/api";
import apiClient from "../client/client";
import type { LoginResponse } from "../models/login/LoginResponse";

export const authService = {
  login: async (credentials: IAuthPayload): Promise<LoginResponse> => {
    const response = await apiClient.post(AUTH_API.login, {
      user_name: credentials.user_name,
      password: credentials.password,
    });
    return response.data;
  },

  logout: async (): Promise<ILogoutResponse> => {
    const response = await apiClient.post(AUTH_API.logout);
    return response.data;
  },
};
