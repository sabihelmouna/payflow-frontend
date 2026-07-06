import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { UserResponse } from '../../../core/models/payment.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>Gestion des utilisateurs</h1>
      <p>{{ users.length }} utilisateur(s) enregistré(s)</p>
    </div>

    <div class="toolbar card" style="margin-bottom:16px; padding:16px;">
      <input type="text" [(ngModel)]="search"
        placeholder="🔍 Rechercher par nom ou email..."
        style="width:350px"/>
      <select [(ngModel)]="filterRole">
        <option value="">Tous les rôles</option>
        <option value="ADMIN">ADMIN</option>
        <option value="PME">PME</option>
      </select>
    </div>

    <!-- Modal Recharge -->
    @if (showRecharge) {
      <div class="modal-overlay" (click)="closeRecharge()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>💰 Recharger le wallet</h3>
          <p>Utilisateur : <strong>{{ selectedUser?.fullName }}</strong></p>
          <p>Solde actuel : <strong>{{ selectedUser?.balance | number:'1.2-2' }} MRU</strong></p>
          <div class="form-group" style="margin-top:16px">
            <label>Montant à créditer (MRU)</label>
            <input type="number" [(ngModel)]="rechargeAmount"
              placeholder="ex: 10000" min="1"/>
          </div>
          @if (rechargeError) {
            <div class="alert alert-error">{{ rechargeError }}</div>
          }
          @if (rechargeSuccess) {
            <div class="alert alert-success">{{ rechargeSuccess }}</div>
          }
          <div class="modal-actions">
            <button class="btn btn-outline" (click)="closeRecharge()">Annuler</button>
            <button class="btn btn-primary" (click)="doRecharge()" [disabled]="recharging">
              {{ recharging ? 'Rechargement...' : '💰 Recharger' }}
            </button>
          </div>
        </div>
      </div>
    }

    <div class="card">
      @if (loading) {
        <div class="loading">Chargement des utilisateurs...</div>
      } @else {
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Rôle</th>
              <th>Solde</th>
              <th>Statut</th>
              <th>Inscription</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (u of filtered; track u.id) {
              <tr>
                <td>{{ u.id }}</td>
                <td><strong>{{ u.fullName }}</strong></td>
                <td>{{ u.email }}</td>
                <td>{{ u.phone }}</td>
                <td>
                  <span class="role-badge {{ u.role.toLowerCase() }}">{{ u.role }}</span>
                </td>
                <td>
                  <strong [class.zero]="u.balance === 0">
                    {{ u.balance | number:'1.2-2' }} MRU
                  </strong>
                </td>
                <td>
                  <span class="badge {{ u.enabled ? 'success' : 'failed' }}">
                    {{ u.enabled ? 'Actif' : 'Désactivé' }}
                  </span>
                </td>
                <td>{{ u.createdAt | date:'dd/MM/yyyy' }}</td>
                <td class="actions-cell">
                  <button class="btn-icon recharge" (click)="openRecharge(u)"
                    title="Recharger wallet">💰</button>
                  <button
                    class="btn-icon {{ u.enabled ? 'disable' : 'enable' }}"
                    (click)="toggleUser(u)"
                    title="{{ u.enabled ? 'Désactiver' : 'Activer' }}">
                    {{ u.enabled ? '🔒' : '🔓' }}
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
        <div class="table-footer">{{ filtered.length }} utilisateur(s)</div>
      }
    </div>
  `,
  styles: [`
    .toolbar { display:flex; gap:12px; align-items:center; }
    select {
      padding:10px 14px; border:1.5px solid var(--border);
      border-radius:8px; font-size:0.9rem; outline:none;
    }
    .loading { text-align:center; padding:48px; color:var(--text-muted); }
    .role-badge {
      padding:3px 10px; border-radius:20px; font-size:0.75rem; font-weight:600;
      &.admin { background:#eff6ff; color:#1d4ed8; }
      &.pme { background:#f0fdf4; color:#16a34a; }
    }
    .zero { color: var(--danger); }
    .table-footer {
      padding:12px 16px; color:var(--text-muted);
      font-size:0.85rem; border-top:1px solid var(--border);
    }
    .actions-cell { display:flex; gap:8px; }
    .btn-icon {
      width:34px; height:34px; border-radius:8px;
      border:none; cursor:pointer; font-size:1rem;
      display:flex; align-items:center; justify-content:center;
      transition:all 0.2s;
      &.recharge { background:#f0fdf4; &:hover { background:#dcfce7; } }
      &.disable { background:#fee2e2; &:hover { background:#fca5a5; } }
      &.enable { background:#dcfce7; &:hover { background:#86efac; } }
    }
    .modal-overlay {
      position:fixed; inset:0;
      background:rgba(0,0,0,0.5);
      display:flex; align-items:center; justify-content:center;
      z-index:1000;
    }
    .modal {
      background:white; border-radius:16px;
      padding:32px; width:420px;
      box-shadow:0 20px 60px rgba(0,0,0,0.2);
      h3 { color:var(--primary); margin-bottom:12px; font-size:1.2rem; }
      p { color:var(--text-muted); margin-bottom:4px; font-size:0.9rem; }
    }
    .modal-actions {
      display:flex; gap:12px; justify-content:flex-end; margin-top:20px;
    }
    .btn-outline {
      padding:10px 20px; border-radius:8px;
      border:1.5px solid var(--border);
      background:white; cursor:pointer;
      font-weight:600; color:var(--text);
      &:hover { background:var(--bg); }
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: UserResponse[] = [];
  loading = true;
  search = '';
  filterRole = '';

  showRecharge = false;
  selectedUser: UserResponse | null = null;
  rechargeAmount: number | null = null;
  recharging = false;
  rechargeError = '';
  rechargeSuccess = '';

  get filtered() {
    return this.users.filter(u => {
      const matchSearch = !this.search ||
        u.fullName.toLowerCase().includes(this.search.toLowerCase()) ||
        u.email.toLowerCase().includes(this.search.toLowerCase());
      const matchRole = !this.filterRole || u.role === this.filterRole;
      return matchSearch && matchRole;
    });
  }

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.adminService.getAllUsers().subscribe(res => {
      this.users = res.data;
      this.loading = false;
    });
  }

  toggleUser(user: UserResponse) {
    this.adminService.toggleUserStatus(user.id).subscribe(res => {
      const index = this.users.findIndex(u => u.id === user.id);
      if (index !== -1) this.users[index] = res.data;
    });
  }

  openRecharge(user: UserResponse) {
    this.selectedUser = user;
    this.rechargeAmount = null;
    this.rechargeError = '';
    this.rechargeSuccess = '';
    this.showRecharge = true;
  }

  closeRecharge() {
    this.showRecharge = false;
    this.selectedUser = null;
  }

  doRecharge() {
    if (!this.rechargeAmount || this.rechargeAmount <= 0) {
      this.rechargeError = 'Montant invalide';
      return;
    }
    this.recharging = true;
    this.rechargeError = '';

    this.adminService.rechargeWallet(
      this.selectedUser!.id,
      this.rechargeAmount
    ).subscribe({
      next: (res) => {
        this.rechargeSuccess = `Wallet rechargé de ${this.rechargeAmount} MRU !`;
        const index = this.users.findIndex(u => u.id === this.selectedUser!.id);
        if (index !== -1) this.users[index] = res.data;
        this.recharging = false;
        setTimeout(() => this.closeRecharge(), 1500);
      },
      error: (err) => {
        this.rechargeError = err.error?.error || 'Erreur lors du rechargement';
        this.recharging = false;
      }
    });
  }
}