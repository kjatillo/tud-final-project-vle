import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registerForm!: FormGroup;

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      roleName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void { }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.userService.register(this.registerForm.value).subscribe({
        next: (response) => {
          console.log('User registed successfully', response);
        },
        error: (error) => {
          console.error('Error registering user', error);
        },
      });
    }
  }
}
