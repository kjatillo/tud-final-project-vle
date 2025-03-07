import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ModuleService } from '../../services/module.service';

@Component({
  selector: 'app-create-module',
  templateUrl: './create-module.component.html',
  styleUrls: ['./create-module.component.scss'],
})
export class CreateModuleComponent {
  createModuleForm!: FormGroup;
  isInstructor = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private moduleService: ModuleService,
    private router: Router
  ) {
    this.createModuleForm = this.fb.group({
      moduleName: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.authService.userRoles$.subscribe(roles => {
      this.isInstructor = roles.includes('Instructor');
    });
  }

  onSubmit(): void {
    if (this.createModuleForm.valid) {
      this.moduleService.createModule(this.createModuleForm.value).subscribe({
        next: (response) => {
          console.log('Module created successfully', response);
          this.router.navigate([`/module/${response.moduleId}`]);
        },
        error: (error) => {
          console.error('Error creating module', error);
        },
      });
    }
  }
}