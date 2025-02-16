import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModuleService } from '../../services/module.service';
import { ModuleFile } from '../../models/module-file.model';

@Component({
  selector: 'app-upload-lecture-note',
  templateUrl: './upload-lecture-note.component.html',
  styleUrls: ['./upload-lecture-note.component.scss']
})
export class UploadLectureNoteComponent implements OnInit {
  moduleId!: string;
  uploadForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private moduleService: ModuleService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.moduleId = this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.uploadForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      file: [null, Validators.required]
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.uploadForm.patchValue({ file: file });
    }
  }

  onSubmit(): void {
    if (this.uploadForm.valid) {
      const moduleFile: ModuleFile = this.uploadForm.value;
      this.moduleService.uploadLectureNote(this.moduleId, moduleFile).subscribe({
        next: (response) => {
          console.log('Lecture note uploaded successfully', response);
          this.router.navigate([`/module/${this.moduleId}`]);
        },
        error: (error) => console.error('Error uploading lecture note', error)
      });
    }
  }
}