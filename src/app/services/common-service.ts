import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonDropdownDto } from '../models/commonDropdown.model';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
 
  private baseUrl = 'https://localhost:7164/api/common';

  constructor(private http: HttpClient) {}

  private params(idClient: number) {
    return { params: new HttpParams().set('idClient', idClient.toString()) };
  }

  getDesignations(idClient: number): Observable<CommonDropdownDto[]> {
    return this.http.get<CommonDropdownDto[]>(`${this.baseUrl}/designationsdropdown`, this.params(idClient));
  }

  getGenders(idClient: number): Observable<CommonDropdownDto[]> {
    return this.http.get<CommonDropdownDto[]>(`${this.baseUrl}/genderdropdown`, this.params(idClient));
  }

  getMaritalStatus(idClient: number): Observable<CommonDropdownDto[]> {
    return this.http.get<CommonDropdownDto[]>(`${this.baseUrl}/maritalstatusdropdown`, this.params(idClient));
  }

  getJobTypes(idClient: number): Observable<CommonDropdownDto[]> {
    return this.http.get<CommonDropdownDto[]>(`${this.baseUrl}/jobtypesdropdown`, this.params(idClient));
  }

  getSections(idClient: number): Observable<CommonDropdownDto[]> {
    return this.http.get<CommonDropdownDto[]>(`${this.baseUrl}/sectionsdropdown`, this.params(idClient));
  }

  getReligions(idClient: number): Observable<CommonDropdownDto[]> {
    return this.http.get<CommonDropdownDto[]>(`${this.baseUrl}/religiondropdown`, this.params(idClient));
  }

  getWeekOffDays(idClient: number): Observable<CommonDropdownDto[]> {
    return this.http.get<CommonDropdownDto[]>(`${this.baseUrl}/weekoffdaysdropdown`, this.params(idClient));
  }

  getEmployeeTypes(idClient: number): Observable<CommonDropdownDto[]> {
    return this.http.get<CommonDropdownDto[]>(`${this.baseUrl}/employeetypesdropdown`, this.params(idClient));
  }

  getEducationLevels(idClient: number): Observable<CommonDropdownDto[]> {
    return this.http.get<CommonDropdownDto[]>(`${this.baseUrl}/educationlevelsdropdown`, this.params(idClient));
  }

  getEducationExams(idClient: number): Observable<CommonDropdownDto[]> {
    return this.http.get<CommonDropdownDto[]>(`${this.baseUrl}/educationexaminationdropdown`, this.params(idClient));
  }

  getEducationResults(idClient: number): Observable<CommonDropdownDto[]> {
    return this.http.get<CommonDropdownDto[]>(`${this.baseUrl}/educationresultdropdown`, this.params(idClient));
  }

  getRelationships(idClient: number): Observable<CommonDropdownDto[]> {
    return this.http.get<CommonDropdownDto[]>(`${this.baseUrl}/relationshipdropdown`, this.params(idClient));
  }

   getDepartments(idClient: number): Observable<CommonDropdownDto[]> {
    return this.http.get<CommonDropdownDto[]>(`${this.baseUrl}/departmentsdropdown`, this.params(idClient));
  }

}
