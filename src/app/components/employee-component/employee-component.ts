import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonService } from '../../services/common-service';
import { EmployeeService } from '../../services/employee-service';
import { CommonDropdownDto } from '../../models/commonDropdown.model';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmployeeListDto } from '../../models/employeeList.model';
import { finalize } from 'rxjs';
import { EmployeeDto } from '../../models/employee.model';
import { dateRangeValidator, passingYearValidator } from '../../validators/custom-validators';
type UiMode = 'INITIAL' | 'ADD' | 'VIEW' | 'EDIT';
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
  uiMode = signal<UiMode>('INITIAL');

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
    this.updateFormState();
    this.uiMode.set('INITIAL');
  }

  updateFormState(): void {
    if (this.uiMode() === 'INITIAL' || this.uiMode() === 'VIEW') {
      this.employeeForm.disable({ emitEvent: false });
    } else {
      this.employeeForm.enable({ emitEvent: false });
    }
  }


  startAdd(): void {
    this.resetForm();
    this.uiMode.set('ADD');
    this.employeeForm.enable();
    this.employeeForm.markAllAsTouched();
    this.updateFormState();
  }

  startEdit(): void {
    this.uiMode.set('EDIT');
    this.updateFormState();
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


  initForm(): void {
    this.employeeForm = this.fb.group({
      id: [0],
      idClient: [this.idClient(), Validators.required],
      employeeName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(250)]],
      employeeNameBangla: [''],
      fatherName: [''],
      motherName: [''],
      birthDate: [''],
      joiningDate: [''],
      contactNo: ['',],
      nationalIdentificationNumber: [''],
      address: ['', Validators.maxLength(250)],
      presentAddress: [''],
      employeeImage: [null],
      idGender: [null],
      idReligion: [null],
      idJobType: [null],
      idEmployeeType: [null],
      idDepartment: [null, Validators.required],
      idSection: [null, Validators.required],
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
      // send ONLY base64 string (without prefix)
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

      //extract pure base64
      const pureBase64 = base64.split(',')[1];

      this.employeeDocuments.at(index).patchValue({
        fileName: file.name,
        uploadedFileExtention: file.name.substring(file.name.lastIndexOf('.')),
        uploadDate: new Date().toISOString().substring(0, 10),
        uploadedFile: pureBase64
      });
    };

    reader.readAsDataURL(file);
  }


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


  addEducation() {
    const group = this.fb.group({
      idClient: [this.idClient(), Validators.required],
      idEducationLevel: [null, Validators.required],
      idEducationExamination: [null, Validators.required],
      idEducationResult: [null, Validators.required],
      major: ['', [Validators.required, Validators.maxLength(50)]],
      passingYear: ['', [Validators.pattern(/^\d{4}$/), passingYearValidator('birthDate')]],
      instituteName: ['', [Validators.required, Validators.maxLength(250)]],
      cgpa: ['']
    });

    this.education.push(group);
    group.markAllAsTouched();
  }


  addDocument() {
    const group = this.fb.group({
      idClient: [this.idClient(), Validators.required],
      id: [0],
      documentName: ['', Validators.required],
      fileName: ['', Validators.required],
      uploadDate: [''],
      uploadedFileExtention: ['' ],
      uploadedFile: [null,]
    });
    this.employeeDocuments.push(group);

    group.markAllAsTouched();
  }


  addFamily() {
    const group = this.fb.group({
      idClient: [this.idClient(), Validators.required],
      id: [0],
      name: ['', Validators.required],
      idGender: [null, Validators.required],
      idRelationship: [null, Validators.required],
      dateOfBirth: [''],
      contactNo: [''],
      currentAddress: ['', Validators.maxLength(500)],
      permanentAddress: ['', Validators.maxLength(500)]
    });

    this.family.push(group);
    group.markAllAsTouched();
  }

  addCertification() {
    const group = this.fb.group({
      idClient: [this.idClient(), Validators.required],
      id: [0],
      certificationTitle: ['', Validators.required],
      certificationInstitute: ['', Validators.required],
      instituteLocation: ['', Validators.maxLength(250)],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required]
    }, {
      validators: dateRangeValidator('fromDate', 'toDate')
    });

    this.certifications.push(group);

    group.markAllAsTouched();
  }



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


  submit(): void {

    const raw = this.employeeForm.getRawValue();

    console.log('=== SUBMIT DEBUG ===');
    console.log(raw);
    console.log('Save clicked');

    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();

      console.log('Form invalid');
      console.log('Form errors:', this.employeeForm.errors);
      console.log('Form value (raw):', this.employeeForm.getRawValue());

      alert('Form is invalid');
      return;
    }

    // ✅ MUST USE getRawValue()
    const payload = this.employeeForm.getRawValue();

    // enforce idClient
    payload.idClient = this.idClient();

    // Fix nested arrays
    payload.employeeEducationInfos?.forEach((e: any) => {
      e.idClient = this.idClient();
      if (!e.id) e.id = 0;
    });

    payload.employeeFamilyInfos?.forEach((f: any) => {
      f.idClient = this.idClient();
      if (!f.id) f.id = 0;
    });

    payload.employeeProfessionalCertifications?.forEach((c: any) => {
      c.idClient = this.idClient();
      if (!c.id) c.id = 0;
    });

    payload.employeeDocuments?.forEach((d: any) => {
      d.idClient = this.idClient();
      if (!d.id) d.id = 0;
    });

    // employeeImage fix
    if (!payload.employeeImage || payload.employeeImage.length === 0) {
      payload.employeeImage = null;
    }

    console.log('FINAL PAYLOAD:', payload);

    this.isSaving.set(true);

    const request$ =
      this.uiMode() === 'EDIT'
        ? this.employeeService.updateEmployee(this.selectedEmployeeId()!, payload)
        : this.employeeService.createEmployee(payload);

    request$
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          alert(
            this.uiMode() === 'EDIT'
              ? 'Employee updated successfully'
              : 'Employee created successfully'
          );
          this.resetForm();
          this.loadEmployees();
        },
        error: err => {
          console.error('Save failed', err);
          alert('Save failed');
        }
      });
  }

  resetForm(): void {
    this.employeeForm.reset();

    // PATCH again AFTER reset
    this.employeeForm.patchValue({
      id: 0,
      idClient: this.idClient(),
      hasOvertime: false,
      hasAttendenceBonus: false,
      isActive: true
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

  cancelEdit(): void {
    this.resetForm();
    this.uiMode.set('INITIAL');
    this.updateFormState();

  }


  onEmployeeClick(employeeId: number): void {
    if (this.uiMode() === 'ADD' || this.uiMode() === 'EDIT') {
      return;
    }

    this.uiMode.set('VIEW');
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


  onImageWheel(event: WheelEvent): void {
    event.preventDefault();

    const img = event.target as HTMLImageElement;
    if (!img || !img.classList.contains('employee-image-preview')) {
      return;
    }

    const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;

    const currentScale =
      img.style.transform.match(/scale\(([^)]+)\)/)?.[1] ?? '1';

    let newScale = +currentScale * zoomFactor;
    newScale = Math.min(Math.max(newScale, 1), 3); // clamp

    img.style.transform = `scale(${newScale})`;
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

    this.uiMode.set('VIEW');
    this.updateFormState();

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