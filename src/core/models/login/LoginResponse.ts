export interface LoginResponse {
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
  accessToken: string;
  roleUser: RoleUser;
}

export interface RoleUser {
  id: string;
  role: Role;
}

export interface Role {
  id: string;
  nombre: string;
}
