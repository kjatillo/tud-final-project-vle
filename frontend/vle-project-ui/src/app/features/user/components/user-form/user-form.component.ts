import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent {
  userForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  addUser(): void {
    if (this.userForm.valid) {
      const newUser: User = this.userForm.value;

      this.userService.addUser(newUser).subscribe({
        next: () => {
          this.userForm.reset();
        },
        error: (error) => {
          console.error('Error adding new user', error);
        }
      });
    }
  }
}
