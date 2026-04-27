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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-component.html',
  styleUrl: './employee-component.css',
})
export class EmployeeComponent implements OnInit {


  employeeForm!: FormGroup;
  idClient = signal<number>(10001001);
  isLoading = signal<boolean>(false);
  searchTerm = signal<string>('');
  isSaving = signal<boolean>(false);
  employeeImagePreview = signal<string | null>(null);

  //  DROPDOWNS
  genders = signal<CommonDropdownDto[]>([]);
  religions = signal<CommonDropdownDto[]>([]);
  jobTypes = signal<CommonDropdownDto[]>([]);
  employeeTypes = signal<CommonDropdownDto[]>([]);
  departments = signal<CommonDropdownDto[]>([]);
  sections = signal<CommonDropdownDto[]>([]);
  designations = signal<CommonDropdownDto[]>([]);
  maritalStatuses = signal<CommonDropdownDto[]>([]);
  weekOffs = signal<CommonDropdownDto[]>([]);
  relationships = signal<CommonDropdownDto[]>([]);
  employeeList = signal<EmployeeListDto[]>([]);
  educationLevels = signal<CommonDropdownDto[]>([]);
  educationExams = signal<CommonDropdownDto[]>([]);
  educationResults = signal<CommonDropdownDto[]>([]);



  constructor(private commonService: CommonService,
    private employeeService: EmployeeService,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.loadEmployees();
    this.initForm();
    this.loadDropdowns();
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
  initForm(): void {
    this.employeeForm = this.fb.group({
      idClient: [this.idClient()],
      employeeName: ['', Validators.required],
      employeeNameBangla: [''],
      fatherName: [''],
      motherName: [''],
      birthDate: [''],
      joiningDate: [''],
      contactNo: [''],
      nationalIdentificationNumber: [''],
      address: [''],
      presentAddress: [''],
      employeeImage: [null],
      idGender: [null],
      idReligion: [null],
      idJobType: [null],
      idEmployeeType: [null],
      idDepartment: [null],
      idSection: [null],
      idDesignation: [null],
      idReportingManager: [null],
      idMaritalStatus: [null],
      idWeekOff: [null],
      hasOvertime: [false],
      hasAttendenceBonus: [false],
      IsActive: [false],
      employeeEducationInfos: this.fb.array([]),
      employeeFamilyInfos: this.fb.array([]),
      employeeProfessionalCertifications: this.fb.array([]),
      employeeDocuments: this.fb.array([])

    });
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Preview (signal)
      this.employeeImagePreview.set(base64);
      // Base64 → byte[]
      const byteString = atob(base64.split(',')[1]);
      const byteArray = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
      }
      // Reactive Form এ set
      this.employeeForm.patchValue({
        employeeImage: Array.from(byteArray)
      });
    };
    reader.readAsDataURL(file);
  }

  onDocumentSelect(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const byteString = atob(base64.split(',')[1]);
      const byteArray = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
      }
      this.employeeDocuments.at(index).patchValue({
        fileName: file.name,
        uploadedFileExtention: file.name.substring(file.name.lastIndexOf('.')),
        uploadDate: new Date().toISOString().substring(0, 10),
        uploadedFile: Array.from(byteArray)
      });
    };

    reader.readAsDataURL(file);
  }
  // ===== FORM ARRAYS =====
  get education(): FormArray {
    return this.employeeForm.get('employeeEducationInfos') as FormArray;
  }

  get family(): FormArray {
    return this.employeeForm.get('employeeFamilyInfos') as FormArray;
  }

  get certifications(): FormArray {
    return this.employeeForm.get('employeeProfessionalCertifications') as FormArray;
  }

  get employeeDocuments(): FormArray {
    return this.employeeForm.get('employeeDocuments') as FormArray;
  }

  // add row
  addEducation() {
    this.education.push(this.fb.group({
      idClient: [this.idClient()],
      idEducationLevel: [null],
      idEducationExamination: [null],
      idEducationResult: [null],
      major: [''],
      passingYear: [''],
      instituteName: [''],
      cgpa: ['']
    }));
  }

  // add row
  addDocument() {
    this.employeeDocuments.push(
      this.fb.group({
        idClient: [this.idClient()],
        id: [0],
        documentName: [''],
        fileName: [''],
        uploadDate: [''],
        uploadedFileExtention: [''],
        uploadedFile: [null]
      })
    );
  }

  // add row
  addFamily() {
    this.family.push(this.fb.group({
      idClient: [this.idClient()],
      id: [0],
      name: [''],
      idGender: [null],
      idRelationship: [null],
      dateOfBirth: [''],
      contactNo: [''],
      currentAddress: [''],
      permanentAddress: ['']
    }));
  }

  // add row
  addCertification() {
    this.certifications.push(
      this.fb.group({
        idClient: [this.idClient()],
        id: [0],
        certificationTitle: [''],
        certificationInstitute: [''],
        instituteLocation: [''],
        fromDate: [''],
        toDate: ['']
      })
    );
  }

  // DROPDOWNS load
  loadDropdowns() {
    this.commonService.getGenders(this.idClient()).subscribe(r => this.genders.set(r));
    this.commonService.getReligions(this.idClient()).subscribe(r => this.religions.set(r));
    this.commonService.getJobTypes(this.idClient()).subscribe(r => this.jobTypes.set(r));
    this.commonService.getEmployeeTypes(this.idClient()).subscribe(r => this.employeeTypes.set(r));
    this.commonService.getSections(this.idClient()).subscribe(r => this.sections.set(r));
    this.commonService.getDesignations(this.idClient()).subscribe(r => this.designations.set(r));
    this.commonService.getMaritalStatus(this.idClient()).subscribe(r => this.maritalStatuses.set(r));
    this.commonService.getWeekOffDays(this.idClient()).subscribe(r => this.weekOffs.set(r));
    this.commonService.getEducationLevels(this.idClient()).subscribe(res => this.educationLevels.set(res));
    this.commonService.getEducationExams(this.idClient()).subscribe(res => this.educationExams.set(res));
    this.commonService.getEducationResults(this.idClient()).subscribe(res => this.educationResults.set(res));
    this.commonService.getRelationships(this.idClient()).subscribe(res => this.relationships.set(res));
    this.commonService.getDepartments(this.idClient()).subscribe(res => this.departments.set(res));


  }

  // ===== SUBMIT =====
  submit() {
    if (this.employeeForm.invalid) return;
    this.isSaving.set(true);
    this.employeeService.createEmployee(this.employeeForm.value)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe(res => {
        alert('Employee created. ID: ' + res.employeeId);
      });
  }


}
