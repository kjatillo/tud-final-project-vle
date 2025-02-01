import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModuleService } from '../../services/module.service';

@Component({
  selector: 'app-edit-module',
  templateUrl: './edit-module.component.html',
  styleUrls: ['./edit-module.component.scss'],
})
export class EditModuleComponent implements OnInit {
  editModuleForm!: FormGroup;
  moduleId!: string;

  constructor(
    private fb: FormBuilder,
    private moduleService: ModuleService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.editModuleForm = this.fb.group({
      moduleName: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.moduleId = this.route.snapshot.paramMap.get('id')!;
    this.moduleService.getModuleById(this.moduleId).subscribe({
      next: (module) => {
        this.editModuleForm.patchValue({
          moduleName: module.moduleName,
          description: module.description,
        });
      },
      error: (error) => console.error('Error fetching module', error),
    });
  }

  onSubmit(): void {
    if (this.editModuleForm.valid) {
      this.moduleService.editModule(this.moduleId, this.editModuleForm.value).subscribe({
        next: (response) => {
          console.log('Module updated successfully', response);
          this.router.navigate([`/module/${this.moduleId}`]);
        },
        error: (error) => {
          console.error('Error updating module', error);
        },
      });
    }
  }
}