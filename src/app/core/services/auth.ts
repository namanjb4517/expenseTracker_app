import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiUrl = 'http://localhost:8081/auth/v1'; // <-- your backend URL

  constructor(private http: HttpClient) {}

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  signup(data: { firstname: string; lastname: string; username: string; email: string; password: string, phonenumber:string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, data);
  }
}
