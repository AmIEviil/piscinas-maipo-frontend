import type { IUploadedFile } from "../../service/uploadedFiles.interface";
import { UPLOADED_FILES_API } from "../api/uploaded-files/api";
import apiClient from "../client/client";

export const uploadedFilesService = {
  findByParentId: async (parentId: string): Promise<IUploadedFile[]> => {
    const response = await apiClient.get<IUploadedFile[]>(
      UPLOADED_FILES_API.findByParentId.replace(":parentId", parentId)
    );
    return response.data;
  },
};
