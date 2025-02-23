import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ModuleContent } from '../../models/module-content.model';
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
  contents: ModuleContent[] = [];
  selectedPageId!: string;
  selectedPageTitle!: string;
  selectedContent!: ModuleContent;
  isInstructor = false;
  showAddContentForm = false;
  showEditContentForm = false;
  showAddPageForm = false;
  showContents = true;

  constructor(
    private route: ActivatedRoute,
    private moduleService: ModuleService,
    private authService: AuthService
  ) { }

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

    this.loadContents(pageId);

    this.showAddContentForm = false;
    this.showEditContentForm = false;
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

  loadContents(pageId: string): void {
    this.moduleService.getContents(this.moduleId, pageId).subscribe(contents => {
      this.contents = contents;
    });
  }

  addPage(): void {
    this.showAddPageForm = true;
    this.showAddContentForm = false;
    this.showEditContentForm = false;
    this.showContents = false;
  }

  addContent(): void {
    this.showAddContentForm = true;
    this.showAddPageForm = false;
    this.showEditContentForm = false;
    this.showContents = false;
  }

  editContent(contentId: string): void {
    this.selectedContent = this.contents.find(content => content.contentId === contentId)!;
    this.showEditContentForm = true;
    this.showAddContentForm = false;
    this.showAddPageForm = false;
    this.showContents = false;
  }

  onContentAdded(): void {
    this.showAddContentForm = false;
    this.showEditContentForm = false;
    this.showContents = true;
    this.loadContents(this.selectedPageId);
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
    this.showEditContentForm = false;
    this.showContents = true;
  }

  onContentUpdated(): void {
    this.showEditContentForm = false;
    this.showContents = true;
    this.loadContents(this.selectedPageId);
  }
}