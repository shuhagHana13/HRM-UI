export interface EmployeeProfessionalCertificationDto {
  idClient: number;
  id: number;

  certificationTitle: string;
  certificationInstitute: string;
  instituteLocation?: string;

  fromDate?: Date | string;
  toDate?: Date | string;

  setDate?: Date | string;
  createdBy?: string;
}