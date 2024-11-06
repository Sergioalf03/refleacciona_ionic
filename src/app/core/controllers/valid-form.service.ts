import { Injectable } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class ValidFormService {

  constructor(
    private toastService: ToastService,
  ) { }

  isValid(form: any, selectors: any[]): boolean {
    if (!form.valid) {
      this.toastService.showErrorToast('Formulario incompleto');
      Object.keys(form.controls).forEach(key => {
        const controlErrors: ValidationErrors = form.get(key).errors;
        if (controlErrors != null) {
          Object.keys(controlErrors).forEach(keyError => {
            console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
          });
        }
      });
      return false;
    }

    const anyNotSelected: any = selectors.find(s => s.required && !s.selected);

    if (!!anyNotSelected) {
      this.toastService.showErrorToast(`Seleccione ${anyNotSelected.name}`);
      return false;
    }

    return true;
  }
}
