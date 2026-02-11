export interface IUploadedFile {
  id: string;
  fileId?: number;
  filename: string;
  url: string;
  mimeType: string;
  parentId: string;
  createdAt: string;
  updatedAt: string;

  type_file?: string;
  size?: string;
  driveId?: string;
  driveUrl?: string;
  uploadDate?: string;
}