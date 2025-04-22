import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Contact } from '../models/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private contactBaseEndpoint = environment.contactApiEndpoint;

  constructor(private http: HttpClient) { }

  submitContactForm(contactData: Contact): Observable<any> {
    return this.http.post(`${this.contactBaseEndpoint}/submit`, contactData);
  }
}
