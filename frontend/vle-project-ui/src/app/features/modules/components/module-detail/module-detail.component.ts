import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModuleService } from '../../services/module.service';
import { Module } from '../../models/module.model';

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
    private moduleService: ModuleService
  ) { }

  ngOnInit(): void {
    this.moduleId = this.route.snapshot.paramMap.get('id');

    if (this.moduleId) {
      this.moduleService.getModuleById(this.moduleId).subscribe({
        next: (module) => {
          this.module = module;
        },
        error: (error) => console.error('Error fetching module', error),
      });
    }
  }

  enrol(): void { }
}