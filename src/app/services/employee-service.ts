import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { EmployeeListDto } from '../models/employeeList.model';
import { EmployeeDto } from '../models/employee.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {

  private baseUrl = 'https://localhost:7164/api/employee';

  constructor(private http: HttpClient) { }

  getEmployees(idClient: number): Observable<EmployeeListDto[]> {
    const params = new HttpParams().set('idClient', idClient.toString());
    return this.http.get<EmployeeListDto[]>(this.baseUrl, { params });
  }

  getEmployeeById(idClient: number, employeeId: number): Observable<EmployeeDto> {
    const params = new HttpParams().set('idClient', idClient.toString());
    return this.http.get<EmployeeDto>(`${this.baseUrl}/${employeeId}`, { params });
  }


  createEmployee(employee: EmployeeDto): Observable<{ employeeId: number }> {
    return this.http.post<{ employeeId: number }>(this.baseUrl,employee);
  }


updateEmployee(employeeId: number, payload: any) {
  const params = new HttpParams().set('idClient', payload.idClient);
  return this.http.put(`${this.baseUrl}/${employeeId}`, payload, { params });
}


 
  softDeleteEmployee(idClient: number, employeeId: number): Observable<{ message: string }> {
    const params = new HttpParams().set('idClient', idClient.toString()).set('employeeId', employeeId.toString());
    return this.http.delete<{ message: string }>(this.baseUrl, { params });
  }

}
