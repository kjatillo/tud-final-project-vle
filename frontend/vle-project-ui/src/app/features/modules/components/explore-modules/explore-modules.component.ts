import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModuleService } from '../../services/module.service';
import { Module } from '../../models/module.model';

@Component({
  selector: 'app-explore',
  templateUrl: './explore-modules.component.html',
  styleUrls: ['./explore-modules.component.scss'],
})
export class ExploreModulesComponent implements OnInit {
  modules: Module[] = [];

  constructor(
    private moduleService: ModuleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.moduleService.getAllModules().subscribe({
      next: (modules) => {
        this.modules = modules;
        console.log(this.modules)
      },
      error: (error) => console.error('Error fetching modules', error),
    });
  }

  navigateToModule(moduleId: string): void {
    this.router.navigate([`/module/${moduleId}`]);
  }
}