import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  isLoggedIn$: Observable<boolean>;
  isAdmin$: Observable<boolean>;
  isInstructor$: Observable<boolean>;
  isAuthResolved$: Observable<boolean>;
  mobileMenuOpen: boolean = false;

  constructor(private authService: AuthService, private router: Router) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;

    this.isAdmin$ = this.authService.userRoles$.pipe(
      map(roles => roles.includes('Admin'))
    );

    this.isInstructor$ = this.authService.userRoles$.pipe(
      map(roles => roles.includes('Instructor'))
    );

    this.isAuthResolved$ = this.authService.isAuthResolved;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
  }
}