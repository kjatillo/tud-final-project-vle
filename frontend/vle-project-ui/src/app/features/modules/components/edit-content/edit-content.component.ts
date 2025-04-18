import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModuleContent } from '../../models/module-content.model';
import { ModuleContentService } from '../../services/module-content.service';

@Component({
  selector: 'app-edit-content',
  templateUrl: './edit-content.component.html',
  styleUrls: ['./edit-content.component.scss']
})
export class EditContentComponent implements OnInit {
  @Input() content!: ModuleContent;
  @Output() contentUpdated = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  moduleId!: string;
  editContentForm!: FormGroup;
  selectedFile: File | null = null;
  initialContentType = 'file'; // Store the original content type
  originalFileName: string | null = null;

  constructor(
    private moduleContentService: ModuleContentService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.moduleId = this.route.snapshot.paramMap.get('id')!;

    // Determine the initial content type
    if (this.content.isLink) this.initialContentType = 'link';
    if (this.content.isUpload) this.initialContentType = 'upload';
    
    // Store original filename if exists
    this.originalFileName = this.content.fileName || null;

    this.editContentForm = this.fb.group({
      title: [this.content.title, Validators.required],
      description: [this.content.description, Validators.required],
      contentType: [this.initialContentType, Validators.required],
      linkUrl: [this.content.linkUrl],
      deadline: [this.content.deadline]
    });

    // Lock the content type to the original value
    this.editContentForm.get('contentType')?.disable();
    
    // Set up validators based on the content type
    this.updateValidators(this.initialContentType);
  }

  updateValidators(contentType: string): void {
    const linkUrlControl = this.editContentForm.get('linkUrl');
    const deadlineControl = this.editContentForm.get('deadline');

    if (contentType === 'link') {
      linkUrlControl?.setValidators([Validators.required, Validators.pattern('https?://.+')]);
      deadlineControl?.clearValidators();
    } else if (contentType === 'file') {
      linkUrlControl?.clearValidators();
      deadlineControl?.clearValidators();
    } else if (contentType === 'upload') {
      linkUrlControl?.clearValidators();
      deadlineControl?.setValidators([Validators.required]);
    }

    linkUrlControl?.updateValueAndValidity();
    deadlineControl?.updateValueAndValidity();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    if (this.editContentForm.valid) {
      const formData = new FormData();
      formData.append('title', this.editContentForm.get('title')?.value);
      formData.append('description', this.editContentForm.get('description')?.value);

      // Use the initial content type since it cannot be changed
      formData.append('isLink', this.initialContentType === 'link' ? 'true' : 'false');
      formData.append('isUpload', this.initialContentType === 'upload' ? 'true' : 'false');

      if (this.initialContentType === 'link') {
        formData.append('linkUrl', this.editContentForm.get('linkUrl')?.value);
      } else if (this.initialContentType === 'file') {
        if (this.selectedFile) {
          formData.append('file', this.selectedFile);
          formData.append('fileName', this.selectedFile.name);
        } else if (this.originalFileName) {
          // If no new file selected but a file existed before, keep the original filename
          formData.append('fileName', this.originalFileName);
        }
      } else if (this.initialContentType === 'upload') {
        formData.append('deadline', this.editContentForm.get('deadline')?.value);
      }

      this.moduleContentService
        .editContent(this.moduleId, this.content.pageId, this.content.contentId, formData)
        .subscribe({
          next: () => {
            this.contentUpdated.emit();
          },
          error: (error) => console.error('Error updating content', error)
        });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
