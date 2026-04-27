import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonService } from '../../services/common-service';
import { EmployeeService } from '../../services/employee-service';
import { CommonDropdownDto } from '../../models/commonDropdown.model';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmployeeListDto } from '../../models/employeeList.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-employee-component',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './employee-component.html',
  styleUrl: './employee-component.css',
})
export class EmployeeComponent implements OnInit{
  constructor(private commonService:CommonService,private employeeService:EmployeeService,private fb:FormBuilder){

  }
  

   idClient =signal<number>(10001001);
   isLoading = signal<boolean>(false);
   searchTerm = signal<string>('')

  // ================= DROPDOWNS =================
  genders: CommonDropdownDto[] = [];
  designations: CommonDropdownDto[] = [];
  employeeTypes: CommonDropdownDto[] = [];
  relationships: CommonDropdownDto[] = [];
   employeeList = signal<EmployeeListDto[]>([]);

  // ================= FORM =================
  employeeForm!: FormGroup;

  ngOnInit(): void {
    this.loadEmployees(); 
    this.buildForm();
    // this.loadDropdowns();
  
  }

  
filteredEmployeeList = computed(() => {
  const term = this.searchTerm().toLowerCase().trim();

  if (!term) {
    return this.employeeList();
  }
 return this.employeeList().filter(emp =>
    (emp.employeeName ?? '').toLowerCase().includes(term) ||
    (emp.designationName ?? '').toLowerCase().includes(term) ||
    emp.employeeId.toString().includes(term)
  );

});


  
 loadEmployees(): void {
  this.isLoading.set(true);

  this.employeeService
    .getEmployees(this.idClient())
    .pipe(
      finalize(() => {
        this.isLoading.set(false);   
      })
    )
    .subscribe({
      next: (res) => {
        this.employeeList.set(res);
     
      },
      error: (err) => {
        console.error('Failed to load employees', err);
      }
    });
}



  // ================= FORM BUILD =================
  buildForm(): void {
    this.employeeForm = this.fb.group({
      idClient: [this.idClient],
      id: [0],

      employeeName: ['', Validators.required],
      employeeNameBangla: [''],
      fatherName: [''],
      motherName: [''],

      contactNo: [''],
      address: [''],
      presentAddress: [''],
      nationalIdentificationNumber: [''],

      birthDate: [''],
      joiningDate: [''],

      idGender: [null, Validators.required],
      idJobType: [null],
      idEmployeeType: [null, Validators.required],
      idDepartment: [null, Validators.required],
      idSection: [null],
      idDesignation: [null],
      idReligion: [null],
      idWeekOff: [null],
      idMaritalStatus: [null],

      hasOvertime: [false],
      hasAttendenceBonus: [false],
      isActive: [true],

      // ========= CHILD ARRAYS =========
      employeeDocuments: this.fb.array([]),
      employeeEducationInfos: this.fb.array([
        this.createEducation()
      ]),
      employeeFamilyInfos: this.fb.array([
        this.createFamily()
      ]),
      employeeProfessionalCertifications: this.fb.array([]),
    });
  }

  // ================= FORM ARRAY HELPERS =================
  get employeeEducationInfos(): FormArray {
    return this.employeeForm.get('employeeEducationInfos') as FormArray;
  }

  get employeeFamilyInfos(): FormArray {
    return this.employeeForm.get('employeeFamilyInfos') as FormArray;
  }

  // ================= CHILD CREATORS =================
  createEducation(): FormGroup {
    return this.fb.group({
      idClient: [this.idClient],
      id: [0],
      idEducationLevel: [null],
      idEducationExamination: [null],
      idEducationResult: [null],
      cgpa: [null],
      examScale: [null],
      marks: [null],
      major: [''],
      passingYear: [null],
      instituteName: [''],
      isForeignInstitute: [false],
      duration: [null],
      achievement: [''],
    });
  }

  createFamily(): FormGroup {
    return this.fb.group({
      idClient: [this.idClient],
      id: [0],
      name: ['', Validators.required],
      idGender: [null],
      idRelationship: [null, Validators.required],
      dateOfBirth: [''],
      contactNo: [''],
      currentAddress: [''],
      permanentAddress: [''],
    });
  }

  // ================= ADD ROWS =================
  addEducation(): void {
    this.employeeEducationInfos.push(this.createEducation());
  }

  addFamily(): void {
    this.employeeFamilyInfos.push(this.createFamily());
  }

  // ================= DROPDOWNS =================
  // loadDropdowns(): void {
  //   this.isLoading = true;

  //   this.commonService.getGenders(this.idClient)
  //     .subscribe(res => this.genders = res);

  //   this.commonService.getDesignations(this.idClient)
  //     .subscribe(res => this.designations = res);

  //   this.commonService.getEmployeeTypes(this.idClient)
  //     .subscribe(res => this.employeeTypes = res);

  //   this.commonService.getRelationships(this.idClient)
  //     .subscribe(res => this.relationships = res);

  //   this.isLoading = false;
  // }

  // ================= SUBMIT =================
  submit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.employeeService.createEmployee(this.employeeForm.value)
      .subscribe({
        next: res => alert(`Employee created successfully (ID: ${res.employeeId})`),
        error: err => {
          console.error(err);
          alert('Failed to create employee');
        }
      });
  }

 

}
