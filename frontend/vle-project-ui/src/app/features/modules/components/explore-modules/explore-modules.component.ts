import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
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
  displayedModules: Module[] = [];
  searchQuery: string = '';
  isAuthResolved$: Observable<boolean>;
  
  pageSize = 5;
  pageSizeOptions = [5, 10, 25];
  pageIndex = 0;

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
        this.updateDisplayedModules();
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
    
    this.pageIndex = 0;
    this.updateDisplayedModules();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateDisplayedModules();
  }

  private updateDisplayedModules(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.displayedModules = this.filteredModules.slice(start, end);
  }
}