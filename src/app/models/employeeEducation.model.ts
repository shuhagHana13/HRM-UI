export interface EmployeeEducationInfoDto {
  idClient: number;
  id: number;

  idEducationLevel: number;
  idEducationExamination: number;
  idEducationResult: number;
  cgpa?: number;
  examScale?: number;
  marks?: number;
  major: string;
  passingYear: number;
  instituteName: string;
  isForeignInstitute: boolean;
  duration?: number;
  achievement?: string;
  setDate?: Date | string;
  createdBy?: string;
}