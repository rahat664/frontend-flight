import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginUrl = `${environment.loginUrl}`;
  constructor(private http: HttpClient) { }

  login(email: string, password: string) {
    return this.http.post(this.loginUrl, { email, password });
  }
}
