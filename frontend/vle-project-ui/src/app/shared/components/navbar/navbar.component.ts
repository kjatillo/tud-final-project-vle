import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../features/users/models/user.model';

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
  currentUser$: Observable<User | null>;
  mobileMenuOpen: boolean = false;
  dropdownOpen: boolean = false;

  constructor(private authService: AuthService, private router: Router) {
    this.currentUser$ = this.authService.currentUser$;
    this.isLoggedIn$ = this.authService.isLoggedIn$;

    this.isAdmin$ = this.authService.userRoles$.pipe(
      map(roles => roles.includes('Admin'))
    );

    this.isInstructor$ = this.authService.userRoles$.pipe(
      map(roles => roles.includes('Instructor'))
    );

    this.isAuthResolved$ = this.authService.isAuthResolved;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.dropdownOpen) return;
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.closest('#userDropdownContainer')) {
      this.dropdownOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscapePress() {
    if (this.dropdownOpen) {
      this.dropdownOpen = false;
    }
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
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