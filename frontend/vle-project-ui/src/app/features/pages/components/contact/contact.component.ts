import { Component, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { MessageDialogComponent } from '../../../../shared/components/message-dialog/message-dialog.component';
import { DIALOG_MESSAGES } from '../../../../shared/constants/dialog-messages';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnDestroy {
  @ViewChild('msgDialog') msgDialog!: MessageDialogComponent;
  contactForm: FormGroup;
  formSubmitted: boolean = false;
  isSubmittingForm: boolean = false;
  isAuthResolved$: Observable<boolean>;
  contactSub!: Subscription;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private contactService: ContactService,
    private router: Router
  ) {
    this.isAuthResolved$ = this.authService.isAuthResolved;

    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnDestroy(): void {
    if (this.contactSub) {
      this.contactSub.unsubscribe();
    }
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      Object.keys(this.contactForm.controls).forEach(key => {
        const control = this.contactForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

     // Unsubscribe from previous submission if it exists
    if (this.contactSub) {
      this.contactSub.unsubscribe();
    }

    this.isSubmittingForm = true;
    
    this.contactSub = this.contactService.submitContactForm(this.contactForm.value).subscribe({
      next: () => {
        this.isSubmittingForm = false;
        this.formSubmitted = true;
        this.contactForm.reset();
      },
      error: (err: any) => {
        this.isSubmittingForm = false;
        this.msgDialog.show('warning', DIALOG_MESSAGES.CONTACT_MSG_FAILED);
        console.error('Error submitting contact form:', err);
      }
    });
  }

  navigateExploreModules(): void {
    this.router.navigate(['/explore']);
  }
}
