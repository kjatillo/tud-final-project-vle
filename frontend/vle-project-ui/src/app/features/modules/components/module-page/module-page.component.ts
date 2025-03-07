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
  currentUser!: string;
  moduleCreator!: string;
  selectedPageId!: string;
  selectedPageTitle!: string;
  selectedContent!: ModuleContent;
  selectedPage!: ModulePage;
  isInstructor = false;
  showAddContentForm = false;
  showEditContentForm = false;
  showAddPageForm = false;
  showEditPageForm = false;
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

    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user.userId;
      }
    });

    if (this.moduleId) {
      this.moduleService.getModuleById(this.moduleId).subscribe({
        next: (module) => {
          this.moduleCreator = module.createdBy;
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

      this.contents.forEach(content => {
        if (content.isUpload) {
          this.getSubmissionFileName(content.contentId);
        }
      });
    });
  }

  getSubmissionFileName(contentId: string): void {
    if (!this.isInstructor) {
      this.moduleService.getSubmission(this.moduleId, contentId).subscribe(response => {
        const content = this.contents.find(c => c.contentId === contentId);
        if (content) {
          content.submissionFileName = response.fileName;
          content.submissionFileUrl = response.fileUrl;
          content.submissionDate = response.submittedDate;
        }
      });
    }
  }

  isPastDeadline(deadline: Date | null): boolean {
    const currentDate = new Date();
    if (deadline != null) {
      return new Date(deadline) < currentDate;
    }

    return false;
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
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent , {
      data: {
        title: "Confirm Page Deletion",
        message: "Deleting a page will also delete any associated content permanently. Are you sure you want to do this?"
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.moduleService.deletePage(this.moduleId, pageId).subscribe({
          next: () => {
            this.loadPages();

            this.selectedPageId = '';
            this.selectedPageTitle = '';
            this.contents = [];
            this.showContents = false;
          },
          error: (error) => console.error('Error deleting page', error)
        });
      }
    });
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
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: {
        title: "Confirm Content Deletion",
        message: "Deleting content permanently. Are you sure you want to do this?"
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.moduleService.deleteContent(this.moduleId, this.selectedPageId, contentId).subscribe({
          next: () => {
            this.loadContents(this.selectedPageId);
          },
          error: (error) => console.error('Error deleting content', error)
        });
      }
    });
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

        this.moduleService.addSubmission(this.moduleId, contentId, formData).subscribe({
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