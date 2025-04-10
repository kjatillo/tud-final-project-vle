import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  isAuthResolved$: Observable<boolean>;

  constructor(private authService: AuthService) {
      this.isAuthResolved$ = this.authService.isAuthResolved;
    }
}