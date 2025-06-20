import { useMutation } from "@tanstack/react-query";
import { userService } from "../core/services/LoginService";

export const useLogin = () => {
  const loginMutation = useMutation({
    mutationFn: userService.getUsers,
    onError: (error: unknown) => {
      console.log(error);
    },
    onSuccess: (data) => {
      console.log(data);
    },
  });
  return loginMutation;
};
