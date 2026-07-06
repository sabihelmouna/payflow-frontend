export interface PaymentRequest {
  receiverEmail: string;
  amount: number;
  description: string;
}

export interface PaymentResponse {
  id: number;
  senderEmail: string;
  receiverEmail: string;
  amount: number;
  description: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  reference: string;
  createdAt: string;
}

export interface WalletResponse {
  id: number;
  ownerEmail: string;
  balance: number;
}

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  enabled: boolean;
  createdAt: string;
  balance: number;
}

export interface DashboardResponse {
  totalUsers: number;
  totalPayments: number;
  successPayments: number;
  failedPayments: number;
  pendingPayments: number;
  totalVolume: number;
}