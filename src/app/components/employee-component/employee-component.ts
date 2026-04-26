import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { EmployeeListDto } from '../../models/employeeList.model';
import { finalize } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-employee-component',
  imports: [CommonModule],
  templateUrl: './employee-component.html',
  styleUrl: './employee-component.css',
})
export class EmployeeComponent implements OnInit {

  private baseUrl = 'https://localhost:7164/api/employee';


  idClient = signal<number>(10001001);
  employeeList = signal<EmployeeListDto[]>([]);
  isLoading = signal<boolean>(false);

  constructor(private http: HttpClient) { }
  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees() {
    this.isLoading.set(true);

    const params = new HttpParams().set('idClient', this.idClient().toString());

    this.http.get<EmployeeListDto[]>(this.baseUrl, { params })
      .pipe(finalize(() => {
        this.isLoading.set(false);
      })
      )
      .subscribe({
        next: (res) => {
          console.log('API response:', res);
          this.employeeList.set(res);
        },
        error: (err) => {
          console.error('Error:', err);
        }
      });
  }


}
