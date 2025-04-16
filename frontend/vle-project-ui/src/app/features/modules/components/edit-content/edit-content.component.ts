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

  constructor(
    private moduleContentService: ModuleContentService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.moduleId = this.route.snapshot.paramMap.get('id')!;

    this.editContentForm = this.fb.group({
      title: [this.content.title, Validators.required],
      description: [this.content.description, Validators.required],
      fileType: [this.content.fileType],
      isLink: [this.content.isLink],
      linkUrl: [this.content.linkUrl, [Validators.required, Validators.pattern('https?://.+')]],
      isUpload: [this.content.isUpload],
      deadline: [this.content.deadline],
      contentType: ['file', Validators.required]
    });

    let initialContentType = 'file';
    if (this.content.isLink) initialContentType = 'link';
    if (this.content.isUpload) initialContentType = 'upload';
    this.editContentForm.patchValue({ contentType: initialContentType });

    this.editContentForm.get('contentType')?.valueChanges.subscribe((contentType: string) => {
      this.updateValidators(contentType);
    });

    this.updateValidators(this.editContentForm.get('contentType')?.value);
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

      const contentType = this.editContentForm.get('contentType')?.value;
      formData.append('isLink', contentType === 'link' ? 'true' : 'false');
      formData.append('isUpload', contentType === 'upload' ? 'true' : 'false');

      if (contentType === 'link') {
        formData.append('linkUrl', this.editContentForm.get('linkUrl')?.value);
      } else if (contentType === 'file') {
        if (this.selectedFile) {
          formData.append('file', this.selectedFile);
          formData.append('fileName', this.selectedFile.name);
        }
      } else if (contentType === 'upload') {
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
