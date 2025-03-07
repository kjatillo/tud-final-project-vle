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
      file: [null],
      fileType: [this.content.fileType],
      isLink: [this.content.isLink],
      linkUrl: [this.content.linkUrl]
    });
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
      formData.append('isLink', this.editContentForm.get('isLink')?.value);

      if (this.editContentForm.get('isLink')?.value) {
        formData.append('linkUrl', this.editContentForm.get('linkUrl')?.value);
      }
      
      if (this.editContentForm.get('file')?.value) {
        formData.append('file', this.editContentForm.get('file')?.value);
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