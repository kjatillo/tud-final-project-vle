import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModulePageService } from '../../services/module-page.service';

@Component({
  selector: 'app-add-page',
  templateUrl: './add-page.component.html',
  styleUrls: ['./add-page.component.scss']
})
export class AddPageComponent implements OnInit {
  @Output() pageAdded = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  moduleId!: string;
  addPageForm!: FormGroup;

  constructor(
    private modulePageService: ModulePageService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.moduleId = this.route.snapshot.paramMap.get('id')!;

    this.addPageForm = this.fb.group({
      title: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.addPageForm.valid) {
      const pageData = this.addPageForm.value;

      this.modulePageService.addPage(this.moduleId, pageData).subscribe({
        next: () => {
          this.pageAdded.emit();
        },
        error: (error) => console.error('Error adding page', error)
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}