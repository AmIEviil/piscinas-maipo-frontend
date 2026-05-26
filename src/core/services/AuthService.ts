import type {
  IAuthPayload,
  ILogoutResponse,
} from "../../service/auth.interface";
import { AUTH_API } from "../api/auth/api";
import apiClient from "../client/client";
import type { LoginResponse } from "../models/login/LoginResponse";

export interface IRequestPasswordResetPayload {
  user_name: string;
  email: string;
}

export interface IResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface IRequestPasswordResetResponse {
  message: string;
}

export interface IResetPasswordResponse {
  message: string;
  token: string;
  refreshToken: string;
  user: LoginResponse;
}

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

  requestPasswordReset: async (
    payload: IRequestPasswordResetPayload
  ): Promise<IRequestPasswordResetResponse> => {
    const response = await apiClient.post(AUTH_API.requestPasswordReset, payload);
    return response.data;
  },

  resetPassword: async (
    payload: IResetPasswordPayload
  ): Promise<IResetPasswordResponse> => {
    const response = await apiClient.patch(AUTH_API.resetPassword, payload);
    return response.data;
  },
};
