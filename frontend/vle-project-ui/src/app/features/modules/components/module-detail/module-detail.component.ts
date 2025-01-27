import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModuleService } from '../../services/module.service';
import { Module } from '../../models/module.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-module-detail',
  templateUrl: './module-detail.component.html',
  styleUrls: ['./module-detail.component.scss'],
})
export class ModuleDetailComponent implements OnInit {
  module: Module | undefined;
  moduleId!: string | null;
  isEnroled!: boolean;

  constructor(
    private route: ActivatedRoute,
    private moduleService: ModuleService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.moduleId = this.route.snapshot.paramMap.get('id');
    
    this.checkEnrolment();
    
    if (this.moduleId) {
      this.moduleService.getModuleById(this.moduleId).subscribe({
        next: (module) => {
          this.module = module;
        },
        error: (error) => console.error('Error fetching module', error),
      });
    }
  }

  checkEnrolment(): void {
    this.moduleService.isUserEnroled(this.moduleId).subscribe({
      next: (isEnroled) => this.isEnroled = isEnroled,
      error: (error) => console.error('Error checking enrollment', error),
    });
  }

  enrol(): void {
    if (this.module) {
      this.moduleService.enrolInModule(this.moduleId).subscribe({
        next: (response) => {
          console.log('Enroled successfully', response);
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate([`/module/${this.moduleId}`]);
          });
        },
        error: (error) => console.error('Error enroling in module', error),
      });
    }
  }
}
