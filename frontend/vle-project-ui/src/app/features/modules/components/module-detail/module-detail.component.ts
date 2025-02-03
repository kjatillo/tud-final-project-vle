import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ModuleService } from '../../services/module.service';
import { Module } from '../../models/module.model';
import { Router } from '@angular/router';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-module-detail',
  templateUrl: './module-detail.component.html',
  styleUrls: ['./module-detail.component.scss'],
})
export class ModuleDetailComponent implements OnInit {
  module!: Module;
  moduleId!: string | null;
  moduleCreator!: string;
  currentUser: string = localStorage.getItem('userId') || '';
  isEnroled!: boolean;

  constructor(
    private route: ActivatedRoute,
    private moduleService: ModuleService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.moduleId = this.route.snapshot.paramMap.get('id');
    this.checkEnrolment();

    if (this.moduleId) {
      this.moduleService.getModuleById(this.moduleId).subscribe({
        next: (module) => {
          this.module = module;
          this.moduleCreator = this.module.createdBy;
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

  editModule(): void {
    if (this.module) {
      this.router.navigate([`/module/${this.moduleId}/edit`]);
    }
  }

  deleteModule(): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.moduleService.deleteModule(this.moduleId).subscribe({
          next: (response) => {
            console.log('Module deleted successfully', response);
            this.router.navigate(['/explore']);
          },
          error: (error) => {
            console.error('Error deleting module', error);
          }
        });
      }
    });
  }
}
