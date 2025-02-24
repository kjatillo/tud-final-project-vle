import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ModuleContent } from '../../models/module-content.model';
import { ModulePage } from '../../models/module-page.model';
import { ModuleService } from '../../services/module.service';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';

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
    private dialog: MatDialog,
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

  deleteContent(contentId: string): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.moduleService.deleteContent(this.moduleId, this.selectedPageId, contentId).subscribe({
          next: (response) => {
            console.log('Content deleted successfully', response);
            this.loadContents(this.selectedPageId);
          },
          error: (error) => console.error('Error deleting content', error)
        });
      }
    });
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