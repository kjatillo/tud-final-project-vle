import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModuleService } from '../../services/module.service';

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
    private route: ActivatedRoute,
    private moduleService: ModuleService,
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
      linkUrl: ['']
    });
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
      formData.append('isLink', this.addContentForm.get('isLink')?.value);
      
      // Append URL to FormData only if content is link to avoid validation error
      if (this.addContentForm.get('isLink')?.value) {
        formData.append('linkUrl', this.addContentForm.get('linkUrl')?.value);
      }
      
      if (this.addContentForm.get('file')?.value) {
        formData.append('file', this.addContentForm.get('file')?.value);
      }

      this.moduleService.addContent(this.moduleId, this.pageId, formData).subscribe({
        next: () => {
          this.contentAdded.emit();
          this.router.navigate([`/module/${this.moduleId}/page/${this.pageId}`]);
        },
        error: (error) => console.error('Error adding content', error)
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}