import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModuleContentService } from '../../services/module-content.service';

@Component({
  selector: 'app-add-content',
  templateUrl: './add-content.component.html',
  styleUrls: ['./add-content.component.scss']
})
export class AddContentComponent implements OnInit {
  @Input() pageId!: string;
  @Output() contentAdded = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  moduleId!: string;
  addContentForm!: FormGroup;

  constructor(
    private moduleContentService: ModuleContentService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.moduleId = this.route.snapshot.paramMap.get('id')!;

    this.addContentForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      file: [null],
      fileType: [''],
      isLink: [false],
      linkUrl: [''],
      isUpload: [false],
      deadline: [this.getDefaultDeadline(), Validators.required],
      contentType: ['file', Validators.required]
    });

    this.addContentForm.get('contentType')?.valueChanges.subscribe((contentType: string) => {
      this.updateValidators(contentType);
    });

    this.updateValidators(this.addContentForm.get('contentType')?.value);
  }

  getDefaultDeadline(): string {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  }

  updateValidators(contentType: string): void {
    const linkUrlControl = this.addContentForm.get('linkUrl');
    const fileControl = this.addContentForm.get('file');
    const deadlineControl = this.addContentForm.get('deadline');

    if (contentType === 'link') {
      linkUrlControl?.setValidators([Validators.required]);
      fileControl?.clearValidators();
      deadlineControl?.clearValidators();
    } else if (contentType === 'file') {
      linkUrlControl?.clearValidators();
      fileControl?.setValidators([Validators.required]);
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
      this.addContentForm.patchValue({ file: file });
      this.addContentForm.patchValue({ fileType: file.type });
    }
  }

  onSubmit(): void {
    if (this.addContentForm.valid) {
      const formData = new FormData();
      formData.append('title', this.addContentForm.get('title')?.value);
      formData.append('description', this.addContentForm.get('description')?.value);

      const contentType = this.addContentForm.get('contentType')?.value;
      formData.append('isLink', contentType === 'link' ? 'true' : 'false');
      formData.append('isUpload', contentType === 'upload' ? 'true' : 'false');

      if (contentType === 'link') {
        formData.append('linkUrl', this.addContentForm.get('linkUrl')?.value);
      } else if (contentType === 'file') {
        formData.append('file', this.addContentForm.get('file')?.value);
      } else if (contentType === 'upload') {
        formData.append('deadline', this.addContentForm.get('deadline')?.value);
      }

      this.moduleContentService.addContent(this.moduleId, this.pageId, formData).subscribe({
        next: () => {
          this.contentAdded.emit();
        },
        error: (error) => console.error('Error adding content', error)
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}