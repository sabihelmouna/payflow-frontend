import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { PaymentService } from '../../../core/services/payment.service';
import { WalletStateService } from '../../../core/services/wallet-state.service';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span class="logo-icon">💳</span>
        <span class="logo-text">PayFlow</span>
      </div>

      <div class="user-info">
        <div class="user-avatar">{{ getInitial() }}</div>
        <div class="user-details">
          <div class="user-name">{{ user?.fullName }}</div>
          <div class="user-role">{{ user?.role }}</div>
        </div>
      </div>

      @if (!isAdmin()) {
        <div class="wallet-sidebar">
          <div class="wallet-sidebar-label">💰 Solde disponible</div>
          <div class="wallet-sidebar-balance">
            {{ balance !== null ? (balance | number:'1.2-2') : '...' }}
            <span>MRU</span>
          </div>
        </div>
      }

      <nav class="sidebar-nav">
        @if (!isAdmin()) {
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🏠</span> Tableau de bord
          </a>
          <a routerLink="/payments" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">💸</span> Paiements
          </a>
          <a routerLink="/payments/new" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">➕</span> Nouveau paiement
          </a>
          <a routerLink="/profile" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">👤</span> Mon profil
          </a>
        }

        @if (isAdmin()) {
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🏠</span> Tableau de bord
          </a>
          <a routerLink="/payments" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">💸</span> Paiements
          </a>
          <a routerLink="/profile" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">👤</span> Mon profil
          </a>
          <div class="nav-section">Administration</div>
          <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📊</span> Dashboard Admin
          </a>
          <a routerLink="/admin/users" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">👥</span> Utilisateurs
          </a>
          <a routerLink="/admin/payments" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">💸</span> Tous les paiements
          </a>
        }
      </nav>

      <button class="logout-btn" (click)="logout()">
        <span>🚪</span> Déconnexion
      </button>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px; height: 100vh;
      background: var(--primary);
      position: fixed; left: 0; top: 0;
      display: flex; flex-direction: column;
      z-index: 100; overflow-y: auto;
    }
    .sidebar-logo {
      padding: 24px 20px;
      display: flex; align-items: center; gap: 10px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      .logo-icon { font-size: 1.5rem; }
      .logo-text { color: white; font-size: 1.3rem; font-weight: 700; }
    }
    .user-info {
      padding: 16px 20px;
      display: flex; align-items: center; gap: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .user-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      background: var(--accent); color: white;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1rem; flex-shrink: 0;
    }
    .user-name { color: white; font-weight: 600; font-size: 0.9rem; }
    .user-role {
      color: rgba(255,255,255,0.6); font-size: 0.75rem;
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .wallet-sidebar {
      margin: 12px; padding: 14px 16px;
      background: rgba(255,255,255,0.1);
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.15);
    }
    .wallet-sidebar-label {
      color: rgba(255,255,255,0.7); font-size: 0.8rem; margin-bottom: 6px;
    }
    .wallet-sidebar-balance {
      color: white; font-size: 1.4rem; font-weight: 800;
      span { font-size: 0.85rem; font-weight: 400; margin-left: 4px; }
    }
    .sidebar-nav { flex: 1; padding: 8px 12px; }
    .nav-section {
      color: rgba(255,255,255,0.4); font-size: 0.7rem;
      text-transform: uppercase; letter-spacing: 0.1em;
      padding: 16px 8px 6px; font-weight: 600;
    }
    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 11px 12px; border-radius: 8px;
      color: rgba(255,255,255,0.75); text-decoration: none;
      font-size: 0.9rem; transition: all 0.2s; margin-bottom: 2px;
      &:hover { background: rgba(255,255,255,0.1); color: white; }
      &.active { background: var(--accent); color: white; font-weight: 600; }
      .nav-icon { font-size: 1rem; }
    }
    .logout-btn {
      margin: 12px; padding: 12px; border-radius: 8px;
      background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.75);
      border: none; cursor: pointer; font-size: 0.9rem;
      display: flex; align-items: center; gap: 8px; transition: all 0.2s;
      &:hover { background: rgba(239,68,68,0.3); color: white; }
    }
  `]
})
export class SidebarComponent implements OnInit {
  user: any;
  balance: number | null = null;

  constructor(
  private authService: AuthService,
  private paymentService: PaymentService,
  private walletState: WalletStateService
) {
  this.user = this.authService.getUser();
}

 ngOnInit() {
  if (!this.isAdmin()) {
    this.loadBalance();
    this.walletState.refresh$.subscribe(() => {
      this.loadBalance();
    });
  }
}


  loadBalance() {
    this.paymentService.getMyWallet().subscribe(res => {
      this.balance = res.data.balance;
    });
  }

  isAdmin() { return this.authService.isAdmin(); }

  logout() { this.authService.logout(); }

  getInitial() {
    return this.user?.fullName?.charAt(0).toUpperCase() || 'U';
  }
}