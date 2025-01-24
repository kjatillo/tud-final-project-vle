import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../features/users/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  isInstructor = false;

  constructor(
    private userService: UserService,
    private authService: AuthService) {
  }

  ngOnInit(): void {
    this.authService.isLoggedIn.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });
    this.authService.userRoles.subscribe((roles) => {
      this.isInstructor = roles.includes('Instructor');
    });
  }

  logout(): void {
    this.userService.logout();
    this.authService.logout();
  }
}
