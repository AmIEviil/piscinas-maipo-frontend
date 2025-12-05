import type { RoleUser } from "../core/models/login/LoginResponse";

export interface User {
  id: string;
  user_name: string;
  first_name: string;
  last_name: string;
  isActive: boolean;
  email: string;
  last_login: string;
  session_closed_at: string;
  failed_attempts: number;
  blocked_until: string;
  refresh_token: string;
  roleUser: RoleUser;
}

export interface CreateUser {
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  roleId: string;
}

export interface UpdateUser {
  user_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  roleId?: string;
}

export interface CreateUserResponse {
  message: string;
  userId: string;
  activationToken: string;
}
