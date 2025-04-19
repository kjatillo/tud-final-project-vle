import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription, map } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../features/users/models/user.model';
import { DropdownService } from '../../services/dropdown.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn$: Observable<boolean>;
  isAdmin$: Observable<boolean>;
  isInstructor$: Observable<boolean>;
  isAuthResolved$: Observable<boolean>;
  currentUser$: Observable<User | null>;
  mobileMenuOpen: boolean = false;
  isUserMenuOpen: boolean = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private dropdownService: DropdownService
  ) {
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

  ngOnInit(): void {
    this.subscriptions.add(
      this.dropdownService.dropdownOpen$.subscribe(dropdownId => {
        if (dropdownId !== 'userDropdown' && this.isUserMenuOpen) {
          this.isUserMenuOpen = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.isUserMenuOpen) return;

    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.closest('#userDropdownContainer')) {
      this.isUserMenuOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscapePress() {
    if (this.isUserMenuOpen) {
      this.isUserMenuOpen = false;
    }
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;

    if (this.isUserMenuOpen) {
      this.dropdownService.notifyDropdownOpened('userDropdown');
    }
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
