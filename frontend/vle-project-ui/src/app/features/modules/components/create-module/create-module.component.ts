import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../users/services/user.service';
import { Instructor } from '../../models/instructor.model';
import { ModuleService } from '../../services/module.service';

@Component({
  selector: 'app-create-module',
  templateUrl: './create-module.component.html',
  styleUrls: ['./create-module.component.scss'],
})
export class CreateModuleComponent {
  createModuleForm!: FormGroup;
  isAdmin$: Observable<boolean>;
  isAuthResolved$: Observable<boolean>;
  instructors: Instructor[] = [];

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private moduleService: ModuleService,
    private router: Router,
    private userService: UserService
  ) {
    this.isAuthResolved$ = this.authService.isAuthResolved;

    this.isAdmin$ = this.authService.userRoles$.pipe(
      map(roles => roles.includes('Admin'))
    );

    this.createModuleForm = this.fb.group({
      moduleName: ['', Validators.required],
      description: ['', Validators.required],
      moduleInstructor: ['', Validators.required],
      price: [0.00, Validators.required]
    });
  }

  ngOnInit(): void {
    this.userService.getInstructors().subscribe(instructors => {
      this.instructors = instructors;
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

  onCancel(): void {
    this.router.navigate(['/']);
  }
}
