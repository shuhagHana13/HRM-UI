import { EmployeeDocumentDto } from "./employeeDocument.model";
import { EmployeeEducationInfoDto } from "./employeeEducation.model";
import { EmployeeFamilyInfoDto } from "./employeeFamilyInfo.model";
import { EmployeeProfessionalCertificationDto } from "./employeeProfessionalCertifications.model";

export interface EmployeeDto {
  idClient: number;
  id: number;
  employeeName?: string;
  employeeNameBangla?: string;
  employeeImage?: Uint8Array;
  fatherName?: string;
  motherName?: string;
  idJobType?: number;
  idEmployeeType?: number;
  birthDate?: Date | string;
  joiningDate?: Date | string;
  idGender?: number;
  idReportingManager?: number;
  idReligion?: number;
  idDepartment: number;
  idSection: number;
  idDesignation?: number;
  hasOvertime?: boolean;
  hasAttendenceBonus?: boolean;
  idWeekOff?: number;
  address?: string;
  presentAddress?: string;
  nationalIdentificationNumber?: string;
  contactNo?: string;
  idMaritalStatus?: number;
  isActive?: boolean;
  setDate?: Date | string;
  createdBy?: string;
  employeeDocuments: EmployeeDocumentDto[];
  employeeEducationInfos: EmployeeEducationInfoDto[];
  employeeFamilyInfos: EmployeeFamilyInfoDto[];
  employeeProfessionalCertifications: EmployeeProfessionalCertificationDto [];
}