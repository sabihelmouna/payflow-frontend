import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { DashboardResponse, PaymentResponse } from '../../../core/models/payment.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <h1>Dashboard Administrateur</h1>
      <p>Vue globale de la plateforme PayFlow</p>
    </div>

    @if (dashboard) {
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background:#eff6ff">👥</div>
          <div class="stat-value">{{ dashboard.totalUsers }}</div>
          <div class="stat-label">Utilisateurs</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#f0fdf4">💸</div>
          <div class="stat-value">{{ dashboard.totalPayments }}</div>
          <div class="stat-label">Total paiements</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#dcfce7">✅</div>
          <div class="stat-value">{{ dashboard.successPayments }}</div>
          <div class="stat-label">Réussis</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#fee2e2">❌</div>
          <div class="stat-value">{{ dashboard.failedPayments }}</div>
          <div class="stat-label">Échoués</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:#fef9c3">⏳</div>
          <div class="stat-value">{{ dashboard.pendingPayments }}</div>
          <div class="stat-label">En attente</div>
        </div>
        <div class="stat-card volume">
          <div class="stat-icon" style="background:#f0fdf4">💰</div>
          <div class="stat-value">{{ dashboard.totalVolume | number:'1.2-2' }}</div>
          <div class="stat-label">Volume total (MRU)</div>
        </div>
      </div>
    }

    <div class="admin-actions card" style="margin-bottom:24px">
      <h3>Actions rapides</h3>
      <div class="actions-grid">
        <a routerLink="/admin/users" class="action-btn">
          <span>👥</span> Gérer les utilisateurs
        </a>
        <a routerLink="/admin/payments" class="action-btn">
          <span>💸</span> Voir tous les paiements
        </a>
      </div>
    </div>

    <div class="card">
      <div class="table-header">
        <h3>Derniers paiements</h3>
      </div>
      @if (loading) {
        <div class="loading">Chargement...</div>
      } @else {
        <table>
          <thead>
            <tr>
              <th>Référence</th>
              <th>Expéditeur</th>
              <th>Destinataire</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            @for (p of payments.slice(0,10); track p.id) {
              <tr>
                <td><code>{{ p.reference | slice:0:12 }}...</code></td>
                <td>{{ p.senderEmail }}</td>
                <td>{{ p.receiverEmail }}</td>
                <td><strong>{{ p.amount | number:'1.2-2' }} MRU</strong></td>
                <td><span class="badge {{ p.status.toLowerCase() }}">{{ p.status }}</span></td>
                <td>{{ p.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
  styles: [`
    .table-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;
      h3 { font-size:1.1rem; font-weight:600; color:var(--primary); } }
    .loading { text-align:center; padding:40px; color:var(--text-muted); }
    code { background:var(--bg); padding:2px 6px; border-radius:4px; font-size:0.8rem; }
    .admin-actions {
      h3 { margin-bottom:16px; color:var(--primary); }
    }
    .actions-grid { display:flex; gap:12px; }
    .action-btn {
      display:flex; align-items:center; gap:8px;
      padding:12px 20px; border-radius:8px;
      background:var(--primary); color:white;
      text-decoration:none; font-weight:600;
      font-size:0.9rem; transition:all 0.2s;
      &:hover { background:var(--primary-light); }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  dashboard: DashboardResponse | null = null;
  payments: PaymentResponse[] = [];
  loading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getDashboard().subscribe(res => {
      this.dashboard = res.data;
    });
    this.adminService.getAllPayments().subscribe(res => {
      this.payments = res.data;
      this.loading = false;
    });
  }
}