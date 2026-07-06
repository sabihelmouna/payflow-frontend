import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PaymentService } from '../../../core/services/payment.service';
import { AuthService } from '../../../core/services/auth.service';
import { WalletResponse, PaymentResponse } from '../../../core/models/payment.model';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <h1>Bonjour, {{ user?.fullName }} 👋</h1>
      <p>Voici un aperçu de votre activité PayFlow</p>
    </div>

    <div class="wallet-card">
      <div class="wallet-left">
        <div class="wallet-label">Solde disponible</div>
        <div class="wallet-balance">
          {{ wallet ? (wallet.balance | number:'1.2-2') : '...' }}
          <span class="wallet-currency">MRU</span>
        </div>
        <div class="wallet-email">{{ wallet?.ownerEmail }}</div>
      </div>
      <div class="wallet-right">
        <span class="wallet-icon">💳</span>
        <a routerLink="/payments/new" class="btn btn-accent">+ Nouveau paiement</a>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background:#eff6ff">💸</div>
        <div class="stat-value">{{ totalSent }}</div>
        <div class="stat-label">Paiements envoyés</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#f0fdf4">📥</div>
        <div class="stat-value">{{ totalReceived }}</div>
        <div class="stat-label">Paiements reçus</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#fef9c3">✅</div>
        <div class="stat-value">{{ totalSuccess }}</div>
        <div class="stat-label">Transactions réussies</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#fef2f2">❌</div>
        <div class="stat-value">{{ totalFailed }}</div>
        <div class="stat-label">Transactions échouées</div>
      </div>
    </div>
    
    @if (payments.length > 0) {
      <div class="charts-row">
        <div class="card chart-card">
          <h3>Répartition des transactions</h3>
          <div class="chart-container">
            <canvas id="paymentChart"></canvas>
          </div>
        </div>
        <div class="card chart-card">
          <h3>Volume des transactions (Derniers jours)</h3>
          <div class="chart-container">
            <canvas id="volumeChart"></canvas>
          </div>
        </div>
      </div>
    }

    <div class="card">
      <div class="table-header">
        <h3>Dernières transactions</h3>
        <a routerLink="/payments" class="btn btn-primary">Voir tout</a>
      </div>

      @if (loading) {
        <div class="loading">Chargement...</div>
      } @else if (payments.length === 0) {
        <div class="empty">
          <span>💸</span>
          <p>Aucune transaction pour le moment</p>
          <a routerLink="/payments/new" class="btn btn-primary">Faire un premier paiement</a>
        </div>
      } @else {
        <table>
          <thead>
            <tr>
              <th>Référence</th>
              <th>De / Vers</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            @for (p of payments.slice(0, 5); track p.id) {
              <tr>
                <td><code>{{ p.reference.slice(0,12) }}...</code></td>
                <td>
                  @if (p.senderEmail === user?.email) {
                    <span class="direction out">↑ {{ p.receiverEmail }}</span>
                  } @else {
                    <span class="direction in">↓ {{ p.senderEmail }}</span>
                  }
                </td>
                <td>
                  <strong
                    [class.amount-out]="p.senderEmail === user?.email"
                    [class.amount-in]="p.senderEmail !== user?.email">
                    {{ p.senderEmail === user?.email ? '-' : '+' }}
                    {{ p.amount | number:'1.2-2' }} MRU
                  </strong>
                </td>
                <td>
                  <span class="badge {{ p.status.toLowerCase() }}">{{ p.status }}</span>
                </td>
                <td>{{ p.createdAt | date:'dd/MM/yyyy' }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
  styles: [`
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    @media (max-width: 768px) { .charts-row { grid-template-columns: 1fr; } }
    .chart-card h3 { color: var(--primary); margin-bottom:16px; font-size:1.1rem; font-weight:600; text-align: center; }
    .chart-container { position: relative; height: 250px; width: 100%; display: flex; justify-content: center; }
    .wallet-card {
      background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
      border-radius: 16px; padding: 28px 32px;
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 24px;
      box-shadow: 0 4px 20px rgba(10,36,99,0.3);
    }
    .wallet-label { color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-bottom: 8px; }
    .wallet-balance {
      color: white; font-size: 2.5rem; font-weight: 800;
    }
    .wallet-currency { font-size: 1.2rem; font-weight: 400; margin-left: 8px; }
    .wallet-email { color: rgba(255,255,255,0.6); font-size: 0.85rem; margin-top: 6px; }
    .wallet-right { display: flex; flex-direction: column; align-items: flex-end; gap: 16px; }
    .wallet-icon { font-size: 2.5rem; }
    .table-header {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 16px;
    }
    .table-header h3 { font-size: 1.1rem; font-weight: 600; color: var(--primary); }
    .loading { text-align: center; padding: 40px; color: var(--text-muted); }
    .empty { text-align: center; padding: 48px; }
    .empty span { font-size: 2.5rem; }
    .empty p { color: var(--text-muted); margin: 12px 0 20px; }
    .direction { font-size: 0.85rem; font-weight: 500; }
    .direction.out { color: var(--danger); }
    .direction.in { color: var(--success); }
    .amount-out { color: var(--danger); }
    .amount-in { color: var(--success); }
    code { background: var(--bg); padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; }
  `]
})
export class HomeComponent implements OnInit, AfterViewInit {
  user: any;
  wallet: WalletResponse | null = null;
  payments: PaymentResponse[] = [];
  loading = true;
  totalSent = 0;
  totalReceived = 0;
  totalSuccess = 0;
  totalFailed = 0;
  chartInstance: any;
  volumeChartInstance: any;

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService
  ) {
    this.user = this.authService.getUser();
  }

  ngOnInit() {
    this.paymentService.getMyWallet().subscribe(res => {
      this.wallet = res.data;
    });

    this.paymentService.getMyPayments().subscribe(res => {
      this.payments = res.data;
      this.totalSent = this.payments.filter(p => p.senderEmail === this.user?.email).length;
      this.totalReceived = this.payments.filter(p => p.receiverEmail === this.user?.email).length;
      this.totalSuccess = this.payments.filter(p => p.status === 'SUCCESS').length;
      this.totalFailed = this.payments.filter(p => p.status === 'FAILED').length;
      this.loading = false;
      
      // Delay chart building slightly to ensure canvas is in DOM
      setTimeout(() => {
        this.buildCharts();
      }, 100);
    });
  }

  ngAfterViewInit(): void {
    // Canvas might not exist here yet due to @if in template
  }

  buildCharts() {
    this.buildStatusChart();
    this.buildVolumeChart();
  }

  buildStatusChart() {
    const canvas = document.getElementById('paymentChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const statusCounts = {
      SUCCESS: this.payments.filter(p => p.status === 'SUCCESS').length,
      FAILED: this.payments.filter(p => p.status === 'FAILED').length,
      PENDING: this.payments.filter(p => p.status === 'PENDING').length,
      CANCELLED: this.payments.filter(p => p.status === 'CANCELLED').length,
    };

    this.chartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Réussis', 'Échoués', 'En attente', 'Annulés'],
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#94a3b8'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  buildVolumeChart() {
    const canvas = document.getElementById('volumeChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.volumeChartInstance) {
      this.volumeChartInstance.destroy();
    }

    // Group by date (last 7 days simplified)
    const datesMap = new Map<string, { in: number, out: number }>();
    
    // Sort payments by date ascending
    const sorted = [...this.payments].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    sorted.forEach(p => {
      if (p.status !== 'SUCCESS') return;
      const dateKey = new Date(p.createdAt).toLocaleDateString('fr-FR');
      if (!datesMap.has(dateKey)) {
        datesMap.set(dateKey, { in: 0, out: 0 });
      }
      const current = datesMap.get(dateKey)!;
      if (p.senderEmail === this.user?.email) {
        current.out += p.amount;
      } else {
        current.in += p.amount;
      }
    });

    const labels = Array.from(datesMap.keys()).slice(-7); // take up to last 7 days
    const dataIn = labels.map(l => datesMap.get(l)!.in);
    const dataOut = labels.map(l => datesMap.get(l)!.out);

    this.volumeChartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Reçus (MRU)',
            data: dataIn,
            backgroundColor: '#10b981',
            borderRadius: 4
          },
          {
            label: 'Envoyés (MRU)',
            data: dataOut,
            backgroundColor: '#ef4444',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
}