import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { Instructor } from '../../models/instructor.model';
import { ModuleService } from '../../services/module.service';

@Component({
  selector: 'app-edit-module',
  templateUrl: './edit-module.component.html',
  styleUrls: ['./edit-module.component.scss'],
})
export class EditModuleComponent implements OnInit {
  @Output() cancelEdit = new EventEmitter<void>();
  editModuleForm!: FormGroup;
  moduleId!: string;
  isAdmin$: Observable<boolean>;
  instructors: Instructor[] = [];

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private moduleService: ModuleService,
    private route: ActivatedRoute,
  ) {
    this.isAdmin$ = this.authService.userRoles$.pipe(
      map(roles => roles.includes('Admin'))
    );

    this.editModuleForm = this.fb.group({
      moduleName: ['', Validators.required],
      description: ['', Validators.required],
      moduleInstructor: ['', Validators.required],
      price: [0.00, Validators.required]
    });
  }

  ngOnInit(): void {
    this.moduleId = this.route.snapshot.paramMap.get('id')!;

    this.authService.getInstructors().subscribe(instructors => {
      this.instructors = instructors;
    });

    this.moduleService.getModuleById(this.moduleId).subscribe({
      next: (module) => {
        this.editModuleForm.patchValue({
          moduleName: module.moduleName,
          description: module.description,
          moduleInstructor: module.moduleInstructor,
          price: module.price
        });
      },
      error: (error) => console.error('Error fetching module', error),
    });
  }

  onSubmit(): void {
    if (this.editModuleForm.valid) {
      console.log(this.editModuleForm.value)
      this.moduleService.editModule(this.moduleId, this.editModuleForm.value).subscribe({
        next: (response) => {
          console.log('Module updated successfully', response);
          this.cancelEdit.emit();
        },
        error: (error) => {
          console.error('Error updating module', error);
        },
      });
    }
  }

  onCancel(): void {
    this.cancelEdit.emit();
  }
}