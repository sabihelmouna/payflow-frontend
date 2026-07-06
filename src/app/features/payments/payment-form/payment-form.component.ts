import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PaymentService } from '../../../core/services/payment.service';
import { WalletStateService } from '../../../core/services/wallet-state.service';
import { Html5QrcodeScanner } from 'html5-qrcode';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-header">
      <h1>Nouveau paiement</h1>
      <p>Envoyez de l'argent à un autre utilisateur PayFlow</p>
    </div>

    <div class="form-layout">
      <div class="card form-card">
        @if (error) {
          <div class="alert alert-error">{{ error }}</div>
        }
        @if (success) {
          <div class="alert alert-success">{{ success }}</div>
        }

        @if (!showConfirm) {
          <div style="display: flex; justify-content: flex-end; margin-bottom: 15px;">
            <button class="btn btn-outline" (click)="toggleScanner()">
              {{ scanning ? 'Fermer le scanner' : '📷 Scanner un QR Code' }}
            </button>
          </div>

          @if (scanning) {
            <div class="scanner-container" style="margin-bottom: 20px; text-align:center;">
               <div id="qr-reader" style="width: 100%;"></div>
            </div>
          }

          <div class="form-group">
            <label>Email du destinataire</label>
            <input type="email" [(ngModel)]="receiverEmail"
              placeholder="destinataire@email.com"/>
          </div>
          <div class="form-group">
            <label>Montant (MRU)</label>
            <input type="number" [(ngModel)]="amount"
              placeholder="0.00" min="0.01" step="0.01"/>
          </div>
          <div class="form-group">
            <label>Description (optionnel)</label>
            <input type="text" [(ngModel)]="description"
              placeholder="Paiement facture, remboursement..."/>
          </div>
          <div class="form-actions">
            <a routerLink="/payments" class="btn btn-outline">Annuler</a>
            <button class="btn btn-primary" (click)="confirm()">
              Continuer →
            </button>
          </div>
        } @else {
          <div class="confirm-box">
            <div class="confirm-title">✅ Confirmer le paiement</div>
            <div class="confirm-row">
              <span>Destinataire</span>
              <strong>{{ receiverEmail }}</strong>
            </div>
            <div class="confirm-row">
              <span>Montant</span>
              <strong class="amount">{{ amount | number:'1.2-2' }} MRU</strong>
            </div>
            @if (description) {
              <div class="confirm-row">
                <span>Description</span>
                <strong>{{ description }}</strong>
              </div>
            }
          </div>
          <div class="form-actions">
            <button class="btn btn-outline" (click)="showConfirm = false">
              ← Modifier
            </button>
            <button class="btn btn-primary" (click)="submit()" [disabled]="loading">
              {{ loading ? 'Envoi en cours...' : '💸 Confirmer le paiement' }}
            </button>
          </div>
        }
      </div>

      
    </div>
  `,
  styles: [`
    .form-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}
    .form-actions {
      display: flex; gap: 12px; justify-content: flex-end;
      margin-top: 24px;
    }
    .btn-outline {
      padding: 10px 20px; border-radius: 8px;
      border: 1.5px solid var(--border);
      background: white; cursor: pointer;
      font-weight: 600; text-decoration: none;
      color: var(--text);
      &:hover { background: var(--bg); }
    }
    .info-card {
      h3 { color: var(--primary); margin-bottom: 16px; font-size: 1rem; }
      ul { padding-left: 20px; }
      li {
        color: var(--text-muted); font-size: 0.9rem;
        padding: 6px 0; border-bottom: 1px solid var(--border);
        &:last-child { border: none; }
      }
    }
    .confirm-box {
      background: var(--bg); border-radius: 10px;
      padding: 20px; margin-bottom: 8px;
    }
    .confirm-title {
      font-size: 1rem; font-weight: 700;
      color: var(--primary); margin-bottom: 16px;
    }
    .confirm-row {
      display: flex; justify-content: space-between;
      padding: 10px 0; border-bottom: 1px solid var(--border);
      font-size: 0.9rem;
      span { color: var(--text-muted); }
      &:last-child { border: none; }
    }
    .amount { color: var(--danger); font-size: 1.1rem; }
    @media (max-width: 768px) {
      .form-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class PaymentFormComponent {
  receiverEmail = '';
  amount: number | null = null;
  description = '';
  loading = false;
  error = '';
  success = '';
  showConfirm = false;
  scanning = false;
  private html5QrcodeScanner: any;

  constructor(
    private paymentService: PaymentService,
    private router: Router,
    private walletState: WalletStateService
  ) {}

  toggleScanner() {
    if (this.scanning) {
      this.stopScan();
    } else {
      this.startScan();
    }
  }

  startScan() {
    this.scanning = true;
    setTimeout(() => {
      this.html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: {width: 250, height: 250} },
        false
      );
      this.html5QrcodeScanner.render(this.onScanSuccess.bind(this), undefined);
    }, 100);
  }

  stopScan() {
    if (this.html5QrcodeScanner) {
      this.html5QrcodeScanner.clear().catch((error: any) => console.error(error));
      this.scanning = false;
    }
  }

  onScanSuccess(decodedText: string) {
    this.stopScan();
    try {
      const data = JSON.parse(decodedText);
      if (data.receiverEmail) this.receiverEmail = data.receiverEmail;
      if (data.amount) this.amount = data.amount;
      
      if (this.receiverEmail && this.amount) {
        this.confirm();
        this.submit();
      } else {
        this.success = "QR scanné avec succès !";
      }
    } catch (e) {
      this.receiverEmail = decodedText;
      this.success = "Email récupéré depuis le QR Code";
    }
  }

  ngOnDestroy() {
    this.stopScan();
  }

  confirm() {
    if (!this.receiverEmail || !this.amount) {
      this.error = 'Email et montant sont obligatoires';
      return;
    }
    this.error = '';
    this.showConfirm = true;
  }

  submit() {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.paymentService.createPayment({
      receiverEmail: this.receiverEmail,
      amount: this.amount!,
      description: this.description
    }).subscribe({
      next: () => {
        this.walletState.triggerRefresh();
        this.success = `Paiement de ${this.amount} MRU envoyé avec succès !`;
        this.loading = false;
        setTimeout(() => this.router.navigate(['/payments']), 2000);
      },
      error: (err) => {
        this.error = err.error?.error || 'Erreur lors du paiement';
        this.loading = false;
        this.showConfirm = false;
      }
    });
  }
}