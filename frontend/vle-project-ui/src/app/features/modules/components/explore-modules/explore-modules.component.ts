import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { Module } from '../../models/module.model';
import { ModuleService } from '../../services/module.service';

@Component({
  selector: 'app-explore',
  templateUrl: './explore-modules.component.html',
  styleUrls: ['./explore-modules.component.scss'],
})
export class ExploreModulesComponent implements OnInit {
  modules: Module[] = [];
  filteredModules: Module[] = [];
  searchQuery: string = '';
  isAuthResolved$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private moduleService: ModuleService,
    private router: Router
  ) { 
    this.isAuthResolved$ = this.authService.isAuthResolved;
  }

  ngOnInit(): void {
    this.moduleService.getModules().subscribe({
      next: (modules) => {
        this.modules = modules;
        this.filteredModules = [...modules];
      },
      error: (error) => console.error('Error fetching modules', error),
    });
  }

  navigateToModule(moduleId: string): void {
    this.router.navigate([`/module/${moduleId}`]);
  }

  onSearch(): void {
    this.filteredModules = this.modules.filter(module =>
      module.moduleName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
}