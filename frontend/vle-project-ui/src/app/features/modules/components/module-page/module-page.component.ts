import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { ModuleContent } from '../../models/module-content.model';
import { ModulePage } from '../../models/module-page.model';
import { AssignmentService } from '../../services/assignment.service';
import { ModuleContentService } from '../../services/module-content.service';
import { ModulePageService } from '../../services/module-page.service';
import { ModuleService } from '../../services/module.service';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-module-page',
  templateUrl: './module-page.component.html',
  styleUrls: ['./module-page.component.scss']
})
export class ModulePageComponent implements OnInit {
  @ViewChild('deleteDialog') deleteDialog!: DeleteConfirmationDialogComponent;
  moduleId!: string;
  pages: ModulePage[] = [];
  contents: ModuleContent[] = [];
  currentUser!: string;
  moduleCreator!: string;
  selectedPageId!: string;
  selectedPageTitle!: string;
  selectedContent!: ModuleContent;
  selectedPage!: ModulePage;
  isModuleInstructor!: boolean;
  showAddContentForm = false;
  showEditContentForm = false;
  showAddPageForm = false;
  showEditPageForm = false;
  showContents = true;
  deleteDialogTitle: string = '';
  deleteDialogMessage: string = '';
  pendingDeleteId: string = '';
  deleteType: 'page' | 'content' = 'page';

  constructor(
    private assignmentService: AssignmentService,
    private authService: AuthService,
    private moduleContentService: ModuleContentService,
    private modulePageService: ModulePageService,
    private moduleService: ModuleService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.moduleId = this.route.snapshot.paramMap.get('id')!;

    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user.userId;
      }
    });

    if (this.moduleId) {
      this.moduleService.getModuleById(this.moduleId).subscribe({
        next: (module) => {
          this.moduleCreator = module.createdBy;

          this.authService.currentUser$.pipe(
            map(user => user?.userId === module.moduleInstructor)
          ).subscribe(isInstructor => {
            this.isModuleInstructor = isInstructor;
          });
        },
        error: (error) => console.error('Error fetching module', error),
      });
    }

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
    this.showEditPageForm = false;
    this.showContents = true;
  }

  loadPages(): void {
    this.modulePageService.getPages(this.moduleId).subscribe(pages => {
      this.pages = pages;
      if (this.pages.length > 0) {
        this.selectPage(this.pages[0].pageId);
      }
    });
  }

  loadContents(pageId: string): void {
    this.moduleContentService.getContents(this.moduleId, pageId).subscribe(contents => {
      this.contents = contents;

      this.contents.forEach(content => {
        if (content.isUpload) {
          this.getSubmissionFileName(content.contentId);
        }
      });
    });
  }

  addPage(): void {
    this.showAddPageForm = true;
    this.showEditPageForm = false;
    this.showAddContentForm = false;
    this.showEditContentForm = false;
    this.showContents = false;
  }

  editPage(pageId: string): void {
    this.selectedPage = this.pages.find(page => page.pageId === pageId)!;
    this.showEditPageForm = true;
    this.showAddPageForm = false;
    this.showAddContentForm = false;
    this.showEditContentForm = false;
    this.showContents = false;
  }

  deletePage(pageId: string): void {
    this.deleteType = 'page';
    this.pendingDeleteId = pageId;
    this.deleteDialogTitle = 'Confirm Page Deletion';
    this.deleteDialogMessage = 'Deleting a page will also delete any associated content permanently. Are you sure you want to do this?';
    this.deleteDialog.show();
  }

  addContent(): void {
    this.showAddContentForm = true;
    this.showAddPageForm = false;
    this.showEditPageForm = false;
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
    this.deleteType = 'content';
    this.pendingDeleteId = contentId;
    this.deleteDialogTitle = 'Confirm Content Deletion';
    this.deleteDialogMessage = 'Deleting content permanently. Are you sure you want to do this?';
    this.deleteDialog.show();
  }

  onDeleteConfirmed(confirmed: boolean): void {
    if (!confirmed) return;

    if (this.deleteType === 'page') {
      this.modulePageService.deletePage(this.moduleId, this.pendingDeleteId).subscribe({
        next: () => {
          this.loadPages();
          this.selectedPageId = '';
          this.selectedPageTitle = '';
          this.contents = [];
          this.showContents = false;
        },
        error: (error) => console.error('Error deleting page', error)
      });
    } else {
      this.moduleContentService.deleteContent(this.moduleId, this.selectedPageId, this.pendingDeleteId).subscribe({
        next: () => {
          this.loadContents(this.selectedPageId);
        },
        error: (error) => console.error('Error deleting content', error)
      });
    }
  }

  getSubmissionFileName(contentId: string): void {
    if (!this.isModuleInstructor) {
      this.assignmentService.getSubmission(contentId).subscribe(response => {
        const content = this.contents.find(c => c.contentId === contentId);
        if (content) {
          content.submissionFileName = response.fileName;
          content.submissionFileUrl = response.fileUrl;
          content.submissionDate = response.submittedDate;
        }
      });
    }
  }

  uploadSubmission(contentId: string): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('contentId', contentId);
        formData.append('moduleId', this.moduleId);
        formData.append('pageId', this.selectedPageId);
        formData.append('fileName', file.name);

        this.assignmentService.addSubmission(formData).subscribe({
          next: () => {
            alert('Submission uploaded successfully');
            this.getSubmissionFileName(contentId);
          },
          error: (error) => {
            console.error('Error uploading submission', error);
          }
        });
      }
    };

    input.click();
  }

  isPastDeadline(deadline: Date | null): boolean {
    const currentDate = new Date();
    if (deadline != null) {
      return new Date(deadline) < currentDate;
    }

    return false;
  }

  getFileType(mimeType: string): string {
    const mimeTypeMap: { [key: string]: string } = {
      // Microsoft Office file types
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint Presentation',
      'application/vnd.ms-powerpoint': 'PowerPoint Presentation (Legacy)',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
      'application/vnd.ms-excel': 'Excel Spreadsheet (Legacy)',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
      'application/msword': 'Word Document (Legacy)',
      'application/vnd.ms-access': 'Microsoft Access Database',
      'application/vnd.visio': 'Microsoft Visio Drawing',

      // PDF
      'application/pdf': 'PDF Document',

      // Images
      'image/jpeg': 'JPEG Image',
      'image/png': 'PNG Image',
      'image/gif': 'GIF Image',
      'image/bmp': 'Bitmap Image',
      'image/webp': 'WebP Image',
      'image/svg+xml': 'SVG Image',

      // Archives
      'application/zip': 'ZIP Archive',
      'application/x-rar-compressed': 'RAR Archive',
      'application/x-7z-compressed': '7-Zip Archive',
      'application/x-tar': 'TAR Archive',
      'application/gzip': 'GZIP Archive',

      // Text files
      'text/plain': 'Plain Text File',
      'text/csv': 'CSV File',
      'text/html': 'HTML File',
      'application/json': 'JSON File',
      'application/xml': 'XML File',
    };

    return mimeTypeMap[mimeType] || 'Unknown File Type';
  }

  onPageAdded(): void {
    this.showAddPageForm = false;
    this.showContents = true;
    this.loadPages();
  }

  onPageUpdated(): void {
    this.showEditPageForm = false;
    this.showContents = true;
    this.loadPages();
  }

  onCancelAddPage(): void {
    this.showAddPageForm = false;
    this.showContents = true;
  }

  onCancelEditPage(): void {
    this.showEditPageForm = false;
    this.showContents = true;
  }

  onContentAdded(): void {
    this.showAddContentForm = false;
    this.showEditContentForm = false;
    this.showContents = true;
    this.loadContents(this.selectedPageId);
  }

  onContentUpdated(): void {
    this.showEditContentForm = false;
    this.showContents = true;
    this.loadContents(this.selectedPageId);
  }

  onCancelAddContent(): void {
    this.showAddContentForm = false;
    this.showEditContentForm = false;
    this.showContents = true;
  }

  onCancelEditContent(): void {
    this.showEditContentForm = false;
    this.showContents = true;
  }
}