import { AbstractControl, FormArray, ValidationErrors, ValidatorFn } from "@angular/forms";

export function dateRangeValidator(
  fromControl: string,
  toControl: string
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const from = group.get(fromControl)?.value;
    const to = group.get(toControl)?.value;

    if (!from || !to) return null;

    const fromDate = new Date(from);
    const toDate = new Date(to);

    return fromDate <= toDate ? null : { dateRangeInvalid: true };
  };
}
export function passingYearValidator(
  birthDateControlName: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const passingYear = control.value;
    const parent = control.parent;

    if (!passingYear || !parent) return null;

    const birthDate = parent.root.get(birthDateControlName)?.value;
    if (!birthDate) return null;

    const birthYear = new Date(birthDate).getFullYear();

    return +passingYear >= birthYear
      ? null
      : { invalidPassingYear: true };
  };
}


