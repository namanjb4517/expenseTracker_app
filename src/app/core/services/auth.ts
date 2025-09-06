import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiUrl = 'http://localhost:8005/auth/v1'; // <-- your backend URL
  private expenseApiUrl = 'http://localhost:8005/expense/v1';
  constructor(private http: HttpClient) {}

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  signup(data: { firstname: string; lastname: string; username: string; email: string; password: string, phonenumber:string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, data);
  }

  isuserAuthenticated(token: string | null): Observable<any> {
    return this.http.get(`${this.apiUrl}/ping`, { headers: { Authorization: `Bearer ${token}` }, responseType: 'text' });
  }

  verifyToken(token: string | null): Observable<any> {
    return this.http.post(`${this.apiUrl}/refreshToken`, { token });
  }

  addExpense(expense: any, token: string | null): Observable<any> {
    return this.http.post(`${this.expenseApiUrl}/addExpense`, expense,{ headers: { Authorization: `Bearer ${token}` }});
  }

  getRecentSpends(token: string | null): Observable<any> {
    return this.http.get(`${this.expenseApiUrl}/getExpense`,{ headers: { Authorization: `Bearer ${token}` }});
    // return this.http.get(`${this.expenseApiUrl}/getExpense`,{ headers: { 'X-User-Id': 'badb423a-aa69-4587-b007-885ea6c9c809',
    //   Authorization: `Bearer ${token}`
    //  }});
    // return this.http.get(`${this.expenseApiUrl}/test`);
  }
}
