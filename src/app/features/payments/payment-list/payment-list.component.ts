import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../../core/services/payment.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaymentResponse } from '../../../core/models/payment.model';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-header">
      <h1>Historique des paiements</h1>
      <p>Toutes vos transactions PayFlow</p>
    </div>

    <div class="toolbar card" style="margin-bottom:16px; padding:16px;">
      <div class="toolbar-left">
        <input type="text" [(ngModel)]="search"
          placeholder="🔍 Rechercher par email ou référence..."
          style="width:300px"/>
        <select [(ngModel)]="filterStatus">
          <option value="">Tous les statuts</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="PENDING">PENDING</option>
          <option value="FAILED">FAILED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>
      <a routerLink="/payments/new" class="btn btn-primary">+ Nouveau paiement</a>
    </div>

    <div class="card">
      @if (loading) {
        <div class="loading">Chargement des transactions...</div>
      } @else if (filtered.length === 0) {
        <div class="empty">
          <span>📭</span>
          <p>Aucun paiement trouvé</p>
        </div>
      } @else {
        <table>
          <thead>
            <tr>
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
                <td><code>{{ p.reference | slice:0:12 }}...</code></td>
                <td>
                  <span [class.me]="p.senderEmail === user?.email">
                    {{ p.senderEmail === user?.email ? 'Moi' : p.senderEmail }}
                  </span>
                </td>
                <td>
                  <span [class.me]="p.receiverEmail === user?.email">
                    {{ p.receiverEmail === user?.email ? 'Moi' : p.receiverEmail }}
                  </span>
                </td>
                <td>
                  <strong [class.amount-out]="p.senderEmail === user?.email"
                           [class.amount-in]="p.senderEmail !== user?.email">
                    {{ p.senderEmail === user?.email ? '-' : '+' }}
                    {{ p.amount | number:'1.2-2' }} MRU
                  </strong>
                </td>
                <td>{{ p.description || '—' }}</td>
                <td><span class="badge {{ p.status.toLowerCase() }}">{{ p.status }}</span></td>
                <td>{{ p.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
              </tr>
            }
          </tbody>
        </table>
        <div class="table-footer">
          {{ filtered.length }} transaction(s) trouvée(s)
        </div>
      }
    </div>
  `,
  styles: [`
    .toolbar { display: flex; justify-content: space-between; align-items: center; }
    .toolbar-left { display: flex; gap: 12px; align-items: center; }
    select {
      padding: 10px 14px; border: 1.5px solid var(--border);
      border-radius: 8px; font-size: 0.9rem; outline: none;
      &:focus { border-color: var(--accent); }
    }
    .loading, .empty {
      text-align: center; padding: 48px; color: var(--text-muted);
      span { font-size: 2rem; display: block; margin-bottom: 8px; }
    }
    .me { font-weight: 600; color: var(--primary); }
    .amount-out { color: var(--danger); }
    .amount-in { color: var(--success); }
    code {
      background: var(--bg); padding: 2px 6px;
      border-radius: 4px; font-size: 0.8rem;
    }
    .table-footer {
      padding: 12px 16px; color: var(--text-muted);
      font-size: 0.85rem; border-top: 1px solid var(--border);
    }
  `]
})
export class PaymentListComponent implements OnInit {
  user: any;
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

  constructor(
  private paymentService: PaymentService,
  private authService: AuthService
) {
  this.user = this.authService.getUser();
}

  ngOnInit() {
    this.paymentService.getMyPayments().subscribe(res => {
      this.payments = res.data;
      this.loading = false;
    });
  }
}