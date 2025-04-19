import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DropdownService {
  private dropdownOpenSource = new Subject<string>();
  public dropdownOpen$ = this.dropdownOpenSource.asObservable();

  public notifyDropdownOpened(dropdownId: string) {
    this.dropdownOpenSource.next(dropdownId);
  }
}
