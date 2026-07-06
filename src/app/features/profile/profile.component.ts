import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';

import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, QRCodeComponent],
  template: `
    <div class="page-header">
      <h1>Mon Profil</h1>
      <p>Gérez vos informations personnelles</p>
    </div>

    <div class="profile-layout">

      <!-- Infos personnelles -->
      <div class="card">
        <div class="card-title">👤 Informations personnelles</div>

        @if (profileSuccess) {
          <div class="alert alert-success">{{ profileSuccess }}</div>
        }
        @if (profileError) {
          <div class="alert alert-error">{{ profileError }}</div>
        }

        <div class="avatar-section">
          <div class="big-avatar">{{ getInitial() }}</div>
          <div>
            <div class="user-role-badge">{{ profile?.role }}</div>
            <div class="user-email">{{ profile?.email }}</div>
          </div>
        </div>

        <div class="form-group">
          <label>Nom complet</label>
          <input type="text" [(ngModel)]="fullName"/>
        </div>
        <div class="form-group">
          <label>Téléphone</label>
          <input type="text" [(ngModel)]="phone"/>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" [value]="profile?.email" disabled
            style="background:#f8fafc; color:var(--text-muted)"/>
        </div>

        <button class="btn btn-primary" (click)="updateProfile()" [disabled]="saving">
          {{ saving ? 'Sauvegarde...' : '💾 Sauvegarder' }}
        </button>
      </div>

      <div class="right-col">

        <!-- Wallet -->
        <div class="card wallet-mini">
          <div class="card-title">💳 Mon Wallet</div>
          <div class="wallet-balance-mini">
            {{ profile?.balance | number:'1.2-2' }}
            <span>MRU</span>
          </div>
          <div class="wallet-label-mini">Solde disponible</div>
        </div>

        <!-- Changer mot de passe -->
        <div class="card">
          <div class="card-title">🔒 Changer le mot de passe</div>

          @if (pwdSuccess) {
            <div class="alert alert-success">{{ pwdSuccess }}</div>
          }
          @if (pwdError) {
            <div class="alert alert-error">{{ pwdError }}</div>
          }

          <div class="form-group">
            <label>Mot de passe actuel</label>
            <input type="password" [(ngModel)]="currentPassword" placeholder="••••••••"/>
          </div>
          <div class="form-group">
            <label>Nouveau mot de passe</label>
            <input type="password" [(ngModel)]="newPassword" placeholder="••••••••"/>
          </div>
          <div class="form-group">
            <label>Confirmer</label>
            <input type="password" [(ngModel)]="confirmPassword" placeholder="••••••••"/>
          </div>

          <button class="btn btn-primary" (click)="changePassword()" [disabled]="changingPwd">
            {{ changingPwd ? 'Modification...' : '🔒 Modifier le mot de passe' }}
          </button>
        </div>

        <!-- QR Code -->
        <div class="card">
          <div class="card-title">📱 Mon QR Code de paiement</div>
          <div class="qr-code-section" style="text-align: center;">
            <p style="margin-bottom: 10px; color: var(--text-muted); font-size: 0.9rem;">
              Présentez ce QR code pour recevoir un paiement.
            </p>
            <div class="form-group" style="text-align: left;">
              <label>Montant demandé (optionnel, en MRU)</label>
              <input type="number" [(ngModel)]="qrAmount" placeholder="0.00" min="0" />
            </div>
            @if (profile?.email) {
              <div style="background: white; padding: 10px; display: inline-block; border-radius: 8px;">
                <qrcode [qrdata]="getQrData()" [width]="200" [errorCorrectionLevel]="'M'"></qrcode>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-layout {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 24px;
      align-items: start;
    }
    .card-title {
      font-size: 1rem; font-weight: 700;
      color: var(--primary); margin-bottom: 20px;
    }
    .avatar-section {
      display: flex; align-items: center; gap: 16px;
      margin-bottom: 24px; padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
    }
    .big-avatar {
      width: 64px; height: 64px; border-radius: 50%;
      background: var(--primary); color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.8rem; font-weight: 700;
    }
    .user-role-badge {
      display: inline-block;
      background: #eff6ff; color: #1d4ed8;
      padding: 2px 10px; border-radius: 20px;
      font-size: 0.75rem; font-weight: 600;
      margin-bottom: 4px;
    }
    .user-email { color: var(--text-muted); font-size: 0.9rem; }
    .right-col { display: flex; flex-direction: column; gap: 20px; }
    .wallet-mini {
      background: linear-gradient(135deg, var(--primary), var(--accent));
    }
    .wallet-mini .card-title { color: rgba(255,255,255,0.8); }
    .wallet-balance-mini {
      font-size: 2rem; font-weight: 800; color: white;
      span { font-size: 1rem; margin-left: 6px; }
    }
    .wallet-label-mini { color: rgba(255,255,255,0.6); font-size: 0.85rem; margin-top: 4px; }
    @media (max-width: 768px) {
      .profile-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class ProfileComponent implements OnInit {
  profile: any = null;
  fullName = '';
  phone = '';
  saving = false;
  profileSuccess = '';
  profileError = '';

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  changingPwd = false;
  pwdSuccess = '';
  pwdError = '';

  qrAmount: number | null = null;

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService
  ) {}

  getQrData(): string {
    const data = {
      receiverEmail: this.profile?.email,
      amount: this.qrAmount
    };
    return JSON.stringify(data);
  }

  ngOnInit() {
    this.paymentService.getMyProfile().subscribe(res => {
      this.profile = res.data;
      this.fullName = res.data.fullName;
      this.phone = res.data.phone;
    });
  }

  getInitial() {
    return this.profile?.fullName?.charAt(0).toUpperCase() || 'U';
  }

  updateProfile() {
    this.saving = true;
    this.profileError = '';
    this.profileSuccess = '';

    this.paymentService.updateProfile({
      fullName: this.fullName,
      phone: this.phone
    }).subscribe({
      next: (res) => {
        this.profile = res.data;
        this.profileSuccess = 'Profil mis à jour avec succès !';
        const user = this.authService.getUser();
        if (user) {
          user.fullName = this.fullName;
          localStorage.setItem('user', JSON.stringify(user));
        }
        this.saving = false;
      },
      error: () => {
        this.profileError = 'Erreur lors de la mise à jour';
        this.saving = false;
      }
    });
  }

  changePassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.pwdError = 'Les mots de passe ne correspondent pas';
      return;
    }
    if (this.newPassword.length < 6) {
      this.pwdError = 'Le mot de passe doit avoir au moins 6 caractères';
      return;
    }
    this.changingPwd = true;
    this.pwdError = '';
    this.pwdSuccess = '';

    this.paymentService.changePassword({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.pwdSuccess = 'Mot de passe modifié avec succès !';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.changingPwd = false;
      },
      error: (err) => {
        this.pwdError = err.error?.error || 'Erreur lors de la modification';
        this.changingPwd = false;
      }
    });
  }
}