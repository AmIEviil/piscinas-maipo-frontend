export interface CreateComprobantePagoDto {
  tipo: string;
  nombre: string;
  fecha_emision: string;
  parentId: string;
}

export interface IComprobantePago {
  id: string;
  tipo: string;
  nombre: string;
  fecha_emision: string;
  parentId: string;
  fileId: string;
  viewUrl: string;
  fileInfo: IFileInfo;
}

interface IFileInfo {
  fileId: number;
  filename: string;
  type_file: string;
  size: string;
  mimeType: string;
  driveId: string;
  driveUrl: string;
  uploadDate: string;
  parentId: string;
}
