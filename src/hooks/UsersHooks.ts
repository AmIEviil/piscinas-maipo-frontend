import { useMutation } from "@tanstack/react-query";
import type { CreateUser, UpdateUser } from "../service/usuariosInterface";
import { usuariosService } from "../core/services/UsuariosService";

export const useUsers = () => {
  const usersMutation = useMutation({
    mutationFn: usuariosService.getUsers,
  });
  return usersMutation;
};

export const useCreateUser = () => {
  const createUserMutation = useMutation({
    mutationFn: (data: CreateUser) => usuariosService.createNewUser(data),
    onError: (error: unknown) => {
      console.log(error);
    },
  });
  return createUserMutation;
};

export const useUpdateUser = () => {
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUser }) =>
      usuariosService.updateUser(userId, data),
    onError: (error: unknown) => {
      console.log(error);
    },
  });
  return updateUserMutation;
};

export const useDeleteUser = () => {
  const deleteUserMutation = useMutation({
    mutationFn: usuariosService.deleteUser,
    onError: (error: unknown) => {
      console.log(error);
    },
  });
  return deleteUserMutation;
};
