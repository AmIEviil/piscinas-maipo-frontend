import { useMutation } from "@tanstack/react-query";
import { authService } from "../core/services/AuthService";

export const useLogin = () => {
  return useMutation({
    mutationFn: authService.login,
    onError: (error: unknown) => {
      console.log(error);
    },
  });
};

export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: authService.requestPasswordReset,
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: authService.resetPassword,
  });
};
