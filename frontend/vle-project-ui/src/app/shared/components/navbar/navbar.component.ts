import { Component } from '@angular/core';
import { UserService } from '../../../features/users/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  isLoggedIn = false;

  constructor(private userService: UserService, private router: Router) {
    this.isLoggedIn = !!localStorage.getItem('userToken');
  }

  logout(): void {
    this.userService.logout();
  }
}
