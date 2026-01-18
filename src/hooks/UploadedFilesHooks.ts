import { useMutation } from "@tanstack/react-query";
import { uploadedFilesService } from "../core/services/UploadedFilesService";

export const useUploadedFilesByParentId = () => {
  const uploadedFilesByParentIdMutation = useMutation({
    mutationFn: (parentId: string) =>
      uploadedFilesService.findByParentId(parentId),
  });
  return uploadedFilesByParentIdMutation;
};
