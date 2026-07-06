import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { DashboardResponse, PaymentResponse, UserResponse } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<ApiResponse<DashboardResponse>> {
    return this.http.get<ApiResponse<DashboardResponse>>(`${this.apiUrl}/dashboard`);
  }

  getAllUsers(): Observable<ApiResponse<UserResponse[]>> {
    return this.http.get<ApiResponse<UserResponse[]>>(`${this.apiUrl}/users`);
  }

  getAllPayments(): Observable<ApiResponse<PaymentResponse[]>> {
    return this.http.get<ApiResponse<PaymentResponse[]>>(`${this.apiUrl}/payments`);
  }

  toggleUserStatus(id: number): Observable<ApiResponse<UserResponse>> {
    return this.http.put<ApiResponse<UserResponse>>(`${this.apiUrl}/users/${id}/toggle`, {});
  }
  rechargeWallet(id: number, amount: number): Observable<ApiResponse<UserResponse>> {
  return this.http.post<ApiResponse<UserResponse>>(
    `${this.apiUrl}/users/${id}/recharge`,
    { amount }
  );
}
}