export interface EmployeeDocumentDto {
  idClient: number;
  id: number;
  documentName: string;
  fileName: string;
  uploadDate: Date | string;
  uploadedFileExtention?: string;
  uploadedFile?: Uint8Array;
  setDate?: Date | string;
  createdBy?: string;
}