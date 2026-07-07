import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { PaymentRequest, PaymentResponse, WalletResponse } from '../models/payment.model';
import { environment } from '../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  getMyWallet(): Observable<ApiResponse<WalletResponse>> {
    return this.http.get<ApiResponse<WalletResponse>>(`${this.apiUrl}/users/wallet`);
  }

  getMyPayments(): Observable<ApiResponse<PaymentResponse[]>> {
    return this.http.get<ApiResponse<PaymentResponse[]>>(`${this.apiUrl}/payments`);
  }

  createPayment(request: PaymentRequest): Observable<ApiResponse<PaymentResponse>> {
    return this.http.post<ApiResponse<PaymentResponse>>(`${this.apiUrl}/payments`, request);
  }
  getMyProfile(): Observable<ApiResponse<any>> {
  return this.http.get<ApiResponse<any>>(`${this.apiUrl}/users/me`);
}

updateProfile(data: {fullName: string, phone: string}): Observable<ApiResponse<any>> {
  return this.http.put<ApiResponse<any>>(`${this.apiUrl}/users/me`, data);
}

changePassword(data: {currentPassword: string, newPassword: string}): Observable<ApiResponse<any>> {
  return this.http.put<ApiResponse<any>>(`${this.apiUrl}/users/me/password`, data);
}
}