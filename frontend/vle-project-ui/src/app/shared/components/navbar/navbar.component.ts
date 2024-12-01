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

  constructor(
    private userService: UserService, 
    private authService: AuthService) {
    this.isLoggedIn = !!localStorage.getItem('userToken');
  }

  ngOnInit(): void {
    this.authService.isLoggedIn.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });
  }

  logout(): void {
    this.userService.logout();
  }
}
