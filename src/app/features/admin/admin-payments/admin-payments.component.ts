import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { PaymentResponse } from '../../../core/models/payment.model';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>Tous les paiements</h1>
      <p>{{ payments.length }} transaction(s) au total</p>
    </div>

    <div class="toolbar card" style="margin-bottom:16px; padding:16px;">
      <input type="text" [(ngModel)]="search"
        placeholder="🔍 Email, référence..."
        style="width:280px"/>
      <select [(ngModel)]="filterStatus">
        <option value="">Tous les statuts</option>
        <option value="SUCCESS">SUCCESS</option>
        <option value="PENDING">PENDING</option>
        <option value="FAILED">FAILED</option>
        <option value="CANCELLED">CANCELLED</option>
      </select>
      <div class="stats-bar">
        <span class="stat-pill success">✅ {{ countByStatus('SUCCESS') }} réussis</span>
        <span class="stat-pill failed">❌ {{ countByStatus('FAILED') }} échoués</span>
        <span class="stat-pill pending">⏳ {{ countByStatus('PENDING') }} en attente</span>
        <span class="stat-pill total">💰 {{ totalVolume() | number:'1.2-2' }} MRU</span>
      </div>
    </div>

    <div class="card">
      @if (loading) {
        <div class="loading">Chargement...</div>
      } @else if (filtered.length === 0) {
        <div class="empty">
          <span>📭</span>
          <p>Aucun paiement trouvé</p>
        </div>
      } @else {
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Référence</th>
              <th>Expéditeur</th>
              <th>Destinataire</th>
              <th>Montant</th>
              <th>Description</th>
              <th>Statut</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            @for (p of filtered; track p.id) {
              <tr>
                <td>{{ p.id }}</td>
                <td><code>{{ p.reference.slice(0,12) }}...</code></td>
                <td>{{ p.senderEmail }}</td>
                <td>{{ p.receiverEmail }}</td>
                <td><strong>{{ p.amount | number:'1.2-2' }} MRU</strong></td>
                <td>{{ p.description || '—' }}</td>
                <td>
                  <span class="badge {{ p.status.toLowerCase() }}">{{ p.status }}</span>
                </td>
                <td>{{ p.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
              </tr>
            }
          </tbody>
        </table>
        <div class="table-footer">{{ filtered.length }} résultat(s)</div>
      }
    </div>
  `,
  styles: [`
    .toolbar { display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
    select {
      padding:10px 14px; border:1.5px solid var(--border);
      border-radius:8px; font-size:0.9rem; outline:none;
    }
    .stats-bar { display:flex; gap:8px; flex-wrap:wrap; margin-left:auto; }
    .stat-pill {
      padding:5px 12px; border-radius:20px; font-size:0.8rem; font-weight:600;
      &.success { background:#dcfce7; color:#16a34a; }
      &.failed { background:#fee2e2; color:#dc2626; }
      &.pending { background:#fef9c3; color:#ca8a04; }
      &.total { background:#eff6ff; color:#1d4ed8; }
    }
    .loading, .empty {
      text-align:center; padding:48px; color:var(--text-muted);
      span { font-size:2rem; display:block; margin-bottom:8px; }
    }
    code { background:var(--bg); padding:2px 6px; border-radius:4px; font-size:0.8rem; }
    .table-footer {
      padding:12px 16px; color:var(--text-muted);
      font-size:0.85rem; border-top:1px solid var(--border);
    }
  `]
})
export class AdminPaymentsComponent implements OnInit {
  payments: PaymentResponse[] = [];
  loading = true;
  search = '';
  filterStatus = '';

  get filtered() {
    return this.payments.filter(p => {
      const matchSearch = !this.search ||
        p.senderEmail.includes(this.search) ||
        p.receiverEmail.includes(this.search) ||
        p.reference.includes(this.search);
      const matchStatus = !this.filterStatus || p.status === this.filterStatus;
      return matchSearch && matchStatus;
    });
  }

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getAllPayments().subscribe(res => {
      this.payments = res.data;
      this.loading = false;
    });
  }

  countByStatus(status: string) {
    return this.payments.filter(p => p.status === status).length;
  }

  totalVolume() {
    return this.payments
      .filter(p => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + p.amount, 0);
  }
}