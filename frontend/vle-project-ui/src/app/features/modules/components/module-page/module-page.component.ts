import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ModulePage } from '../../models/module-page.model';
import { ModuleService } from '../../services/module.service';

@Component({
  selector: 'app-module-page',
  templateUrl: './module-page.component.html',
  styleUrls: ['./module-page.component.scss']
})
export class ModulePageComponent implements OnInit {
  moduleId!: string;
  pages: ModulePage[] = [];
  selectedPageId!: string;
  selectedPageTitle!: string;
  isInstructor = false;
  showAddContentForm = false;
  showAddPageForm = false;
  showContents = true;

  constructor(
    private route: ActivatedRoute,
    private moduleService: ModuleService,
    private authService: AuthService  ) {}

  ngOnInit(): void {
    this.moduleId = this.route.snapshot.paramMap.get('id')!;
    this.authService.userRoles$.subscribe(roles => {
      this.isInstructor = roles.includes('Instructor');
    });

    this.loadPages();
  }

  selectPage(pageId: string): void {
    this.selectedPageId = pageId;
    const selectedPage = this.pages.find(page => page.pageId === pageId);
    this.selectedPageTitle = selectedPage ? selectedPage.title : '';

    this.showAddContentForm = false;
    this.showAddPageForm = false;
    this.showContents = true;
  }

  loadPages(): void {
    this.moduleService.getPages(this.moduleId).subscribe(pages => {
      this.pages = pages;
      if (this.pages.length > 0) {
        this.selectPage(this.pages[0].pageId);
      }
    });
  }

  addPage(): void {
    this.showAddPageForm = true;
    this.showAddContentForm = false;
    this.showContents = false;
  }

  onPageAdded(): void {
    this.showAddPageForm = false;
    this.showContents = true;
    this.loadPages();
  }

  onCancelAddPage(): void {
    this.showAddPageForm = false;
    this.showContents = true;
  }

  onCancelAddContent(): void {
    this.showAddContentForm = false;
    this.showContents = true;
  }
}