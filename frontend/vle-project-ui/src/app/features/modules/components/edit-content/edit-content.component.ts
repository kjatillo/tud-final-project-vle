import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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

  constructor(
    private moduleContentService: ModuleContentService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.moduleId = this.route.snapshot.paramMap.get('id')!;

    this.editContentForm = this.fb.group({
      title: [this.content.title, Validators.required],
      description: [this.content.description, Validators.required],
      file: [this.content.file],
      fileType: [this.content.fileType],
      isLink: [this.content.isLink],
      linkUrl: [this.content.linkUrl],
      deadline: [this.content.deadline, Validators.required],
      contentType: [null, Validators.required]
    });

    this.editContentForm.get('contentType')?.valueChanges.subscribe((contentType: string) => {
      this.updateValidators(contentType);
    });

    this.updateValidators(this.editContentForm.get('contentType')?.value);
  }

  updateValidators(contentType: string): void {
    const linkUrlControl = this.editContentForm.get('linkUrl');
    const fileControl = this.editContentForm.get('file');
    const deadlineControl = this.editContentForm.get('deadline');

    if (contentType === 'link') {
      linkUrlControl?.setValidators([Validators.required]);
      fileControl?.clearValidators();
      deadlineControl?.clearValidators();
    } else if (contentType === 'file') {
      linkUrlControl?.clearValidators();
      // fileControl?.setValidators([Validators.required]);
      deadlineControl?.clearValidators();
    } else if (contentType === 'upload') {
      linkUrlControl?.clearValidators();
      fileControl?.clearValidators();
      deadlineControl?.setValidators([Validators.required]);
    }

    linkUrlControl?.updateValueAndValidity();
    fileControl?.updateValueAndValidity();
    deadlineControl?.updateValueAndValidity();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.editContentForm.patchValue({ file: file });
      this.editContentForm.patchValue({ fileType: file.type });
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
        formData.append('file', this.editContentForm.get('file')?.value);
      } else if (contentType === 'upload') {
        formData.append('deadline', this.editContentForm.get('deadline')?.value);
      }

      this.moduleContentService
      .editContent(this.moduleId, this.content.pageId, this.content.contentId, formData)
      .subscribe({
        next: () => {
          this.contentUpdated.emit();
          this.router.navigate([`/module/${this.moduleId}/page/${this.content.pageId}`]);
        },
        error: (error) => console.error('Error updating content', error)
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}