import { useMutation } from "@tanstack/react-query";
import { authService } from "../core/services/AuthService";

export const useLogin = () => {
  const loginMutation = useMutation({
    mutationFn: async (payload: { user_name: string; password: string }) =>
      authService.login(payload),
    onError: (error) => {
      console.error("Login error:", error);
    },
  });
  return loginMutation;
};
