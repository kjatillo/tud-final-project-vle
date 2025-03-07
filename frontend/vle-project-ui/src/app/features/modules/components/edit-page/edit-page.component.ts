import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModulePage } from '../../models/module-page.model';
import { ModulePageService } from '../../services/module-page.service';

@Component({
  selector: 'app-edit-page',
  templateUrl: './edit-page.component.html',
  styleUrls: ['./edit-page.component.scss']
})
export class EditPageComponent implements OnInit {
  @Input() page!: ModulePage;
  @Output() pageUpdated = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  moduleId!: string;
  editPageForm!: FormGroup;

  constructor(
    private modulePageService: ModulePageService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.moduleId = this.route.snapshot.paramMap.get('id')!;
    this.editPageForm = this.fb.group({
      title: [this.page.title, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.editPageForm.valid) {
      const pageData = this.editPageForm.value;
      this.modulePageService.editPage(this.moduleId, this.page.pageId, pageData)
      .subscribe({
        next: () => {
          this.pageUpdated.emit();
          this.router.navigate([`/module/${this.moduleId}`]);
        },
        error: (error) => console.error('Error updating page', error)
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}