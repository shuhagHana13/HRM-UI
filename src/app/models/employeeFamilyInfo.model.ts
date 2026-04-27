export interface EmployeeFamilyInfoDto {
  idClient: number;
  id: number;
  name: string;
  idGender: number;
  idRelationship: number;
  dateOfBirth?: Date | string;
  contactNo?: string;
  currentAddress?: string;
  permanentAddress?: string;
  setDate?: Date | string;
  createdBy?: string;
}