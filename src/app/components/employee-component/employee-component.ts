import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonService } from '../../services/common-service';
import { EmployeeService } from '../../services/employee-service';
import { CommonDropdownDto } from '../../models/commonDropdown.model';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmployeeListDto } from '../../models/employeeList.model';
import { finalize } from 'rxjs';
import { EmployeeDto } from '../../models/employee.model';

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
  isEditMode = signal<boolean>(false);
  selectedEmployeeId = signal<number | null>(null);


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
      id: [0],   // MUST for update operation, will be patched in edit mode
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
      isActive: [false],
      employeeEducationInfos: this.fb.array([]),
      employeeFamilyInfos: this.fb.array([]),
      employeeProfessionalCertifications: this.fb.array([]),
      employeeDocuments: this.fb.array([])

    });
  }


  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;

      this.employeeImagePreview.set(base64);

      // ✅ send ONLY base64 string (without prefix)
      const pureBase64 = base64.split(',')[1];

      this.employeeForm.patchValue({
        employeeImage: pureBase64
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

      // ✅ extract pure base64
      const pureBase64 = base64.split(',')[1];

      this.employeeDocuments.at(index).patchValue({
        fileName: file.name,
        uploadedFileExtention: file.name.substring(file.name.lastIndexOf('.')),
        uploadDate: new Date().toISOString().substring(0, 10),
        uploadedFile: pureBase64   // ✅ FIXED
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
  submit(): void {
    if (this.employeeForm.invalid) return;

    let payload = { ...this.employeeForm.value };

    // ✅ ALWAYS enforce idClient
    payload.idClient = this.idClient();

    // ✅ Fix nested arrays
    payload.employeeEducationInfos?.forEach((e: any) => e.idClient = this.idClient());
    payload.employeeFamilyInfos?.forEach((f: any) => f.idClient = this.idClient());
    payload.employeeProfessionalCertifications?.forEach((c: any) => c.idClient = this.idClient());
    payload.employeeDocuments?.forEach((d: any) => d.idClient = this.idClient());

    // ✅ employeeImage fix
    if (!payload.employeeImage || payload.employeeImage.length === 0) {
      payload.employeeImage = null;
    }

    this.isSaving.set(true);

    const request$ = this.isEditMode()
      ? this.employeeService.updateEmployee(this.selectedEmployeeId()!, payload)
      : this.employeeService.createEmployee(payload);

    request$
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          alert(this.isEditMode() ? 'Employee updated successfully' : 'Employee created successfully');
          this.resetForm();
          this.loadEmployees();
        },
        error: err => console.error(err)
      });
  }

  resetForm(): void {
    this.employeeForm.reset();

    // ✅ PATCH again AFTER reset
    this.employeeForm.patchValue({
      id: 0,
      idClient: this.idClient(),
      hasOvertime: false,
      hasAttendenceBonus: false,
      isActive: false
    });

    // clear arrays
    this.education.clear();
    this.family.clear();
    this.certifications.clear();
    this.employeeDocuments.clear();

    this.employeeImagePreview.set(null);
    this.isEditMode.set(false);
    this.selectedEmployeeId.set(null);
  }


  //Edit operation
  onEmployeeClick(employeeId: number): void {
    this.isEditMode.set(true);
    this.selectedEmployeeId.set(employeeId);

    this.loadEmployeeById(employeeId);
  }


  loadEmployeeById(employeeId: number): void {
    this.isLoading.set(true);

    this.employeeService
      .getEmployeeById(this.idClient(), employeeId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe(emp => {
        this.populateForm(emp);
      });
  }
  populateForm(emp: EmployeeDto): void {

    // ---------- MAIN FORM ----------

    this.employeeForm.patchValue({
      id: emp.id,
      idClient: emp.idClient,
      employeeName: emp.employeeName,
      employeeNameBangla: emp.employeeNameBangla,
      fatherName: emp.fatherName,
      motherName: emp.motherName,
      birthDate: emp.birthDate,
      joiningDate: emp.joiningDate,
      contactNo: emp.contactNo,
      nationalIdentificationNumber: emp.nationalIdentificationNumber,
      address: emp.address,
      presentAddress: emp.presentAddress,
      idGender: emp.idGender,
      idReligion: emp.idReligion,
      idJobType: emp.idJobType,
      idEmployeeType: emp.idEmployeeType,
      idDepartment: emp.idDepartment,
      idSection: emp.idSection,
      idDesignation: emp.idDesignation,
      idReportingManager: emp.idReportingManager,
      idMaritalStatus: emp.idMaritalStatus,
      idWeekOff: emp.idWeekOff,
      hasOvertime: emp.hasOvertime,
      hasAttendenceBonus: emp.hasAttendenceBonus,
      isActive: emp.isActive,
      employeeImage: emp.employeeImage ?? null
    });
    if (emp.employeeImage) {
      this.employeeImagePreview.set(
        'data:image/png;base64,' + emp.employeeImage
      );
    } else {
      this.employeeImagePreview.set(null);
    }


    // ---------- EDUCATION ----------
    this.education.clear();
    emp.employeeEducationInfos?.forEach(e => {
      this.education.push(this.fb.group({
        idClient: emp.idClient,
        idEducationLevel: e.idEducationLevel,
        idEducationExamination: e.idEducationExamination,
        idEducationResult: e.idEducationResult,
        major: e.major,
        passingYear: e.passingYear,
        instituteName: e.instituteName,
        cgpa: e.cgpa
      }));
    });

    // ---------- FAMILY ----------
    this.family.clear();
    emp.employeeFamilyInfos?.forEach(f => {
      this.family.push(this.fb.group({
        idClient: emp.idClient,
        id: f.id,
        name: f.name,
        idGender: f.idGender,
        idRelationship: f.idRelationship,
        dateOfBirth: f.dateOfBirth,
        contactNo: f.contactNo,
        currentAddress: f.currentAddress,
        permanentAddress: f.permanentAddress
      }));
    });

    // ---------- CERTIFICATIONS ----------
    this.certifications.clear();
    emp.employeeProfessionalCertifications?.forEach(c => {
      this.certifications.push(this.fb.group({
        idClient: emp.idClient,
        id: c.id,
        certificationTitle: c.certificationTitle,
        certificationInstitute: c.certificationInstitute,
        instituteLocation: c.instituteLocation,
        fromDate: c.fromDate,
        toDate: c.toDate
      }));
    });

    // ---------- DOCUMENTS ----------
    this.employeeDocuments.clear();
    emp.employeeDocuments?.forEach(d => {
      this.employeeDocuments.push(this.fb.group({
        idClient: emp.idClient,
        id: d.id,
        documentName: d.documentName,
        fileName: d.fileName,
        uploadDate: d.uploadDate,
        uploadedFileExtention: d.uploadedFileExtention,
        uploadedFile: null // file reselect required
      }));
    });
  }

  deleteEmployee(): void {
    if (!this.selectedEmployeeId()) return;

    const confirmed = confirm('Are you sure you want to delete this employee?');
    if (!confirmed) return;

    this.isSaving.set(true);

    this.employeeService
      .softDeleteEmployee(this.idClient(), this.selectedEmployeeId()!)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: res => {
          alert(res.message || 'Employee deleted successfully');
          this.resetForm();
          this.loadEmployees();
        },
        error: err => {
          console.error('Delete failed', err);
          alert('Failed to delete employee');
        }
      });
  }

  cancelEdit(): void {
    this.resetForm();
  }
  removeEducationRow(index: number): void {
    this.education.removeAt(index);
  }
  removeCertificationRow(index: number): void {
    this.certifications.removeAt(index);
  }
  removeFamilyRow(index: number): void {
    this.family.removeAt(index);
  }
  removeDocumentRow(index: number): void {
    this.employeeDocuments.removeAt(index);
  }
}