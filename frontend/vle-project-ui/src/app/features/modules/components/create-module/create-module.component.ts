import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModuleService } from '../../services/module.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-module',
  templateUrl: './create-module.component.html',
  styleUrls: ['./create-module.component.scss'],
})
export class CreateModuleComponent {
  createModuleForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private moduleService: ModuleService,
    private router: Router
  ) {
    this.createModuleForm = this.fb.group({
      moduleName: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.createModuleForm.valid) {
      this.moduleService.createModule(this.createModuleForm.value).subscribe({
        next: (response) => {
          console.log('Module created successfully', response);
          this.router.navigate([`/module/${response.module.moduleID}`]);
        },
        error: (error) => {
          console.error('Error creating module', error);
        },
      });
    }
  }
}
