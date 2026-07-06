import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-left">
        <div class="auth-brand">
          <div class="brand-logo">💳</div>
          <h1>PayFlow</h1>
          <p>La plateforme de paiement numérique pour les PME mauritaniennes</p>
        </div>
        <div class="auth-features">
          <div class="feature">✅ Paiements sécurisés JWT</div>
          <div class="feature">✅ Tableau de bord en temps réel</div>
          <div class="feature">✅ Historique complet des transactions</div>
          <div class="feature">✅ Gestion multi-utilisateurs</div>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-card">
          <h2>Connexion</h2>
          <p class="auth-subtitle">Accédez à votre espace PayFlow</p>

          @if (error) {
            <div class="alert alert-error">{{ error }}</div>
          }

          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="email"
              placeholder="votre@email.com" [class.error]="submitted && !email"/>
            @if (submitted && !email) {
              <span class="error-msg">Email requis</span>
            }
          </div>

          <div class="form-group">
            <label>Mot de passe</label>
            <input type="password" [(ngModel)]="password"
              placeholder="••••••••" [class.error]="submitted && !password"/>
            @if (submitted && !password) {
              <span class="error-msg">Mot de passe requis</span>
            }
          </div>

          <button class="btn btn-primary w-full" (click)="login()" [disabled]="loading">
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>

          <p class="auth-link">
            Pas encore de compte ?
            <a routerLink="/auth/register">Créer un compte</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex; min-height: 100vh;
    }
    .auth-left {
      flex: 1;
      background: var(--primary);
      display: flex; flex-direction: column;
      justify-content: center; padding: 60px;
    }
    .auth-brand {
      margin-bottom: 48px;
      .brand-logo { font-size: 3rem; margin-bottom: 16px; }
      h1 { color: white; font-size: 2.5rem; font-weight: 800; margin-bottom: 12px; }
      p { color: rgba(255,255,255,0.7); font-size: 1.1rem; line-height: 1.6; }
    }
    .feature {
      color: rgba(255,255,255,0.85);
      font-size: 0.95rem;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .auth-right {
      width: 480px;
      display: flex; align-items: center; justify-content: center;
      padding: 40px; background: var(--bg);
    }
    .auth-card {
      width: 100%;
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      h2 { font-size: 1.6rem; font-weight: 700; color: var(--primary); margin-bottom: 6px; }
    }
    .auth-subtitle { color: var(--text-muted); margin-bottom: 28px; font-size: 0.95rem; }
    .w-full { width: 100%; margin-top: 8px; padding: 12px; font-size: 1rem; }
    .auth-link {
      text-align: center; margin-top: 20px;
      color: var(--text-muted); font-size: 0.9rem;
      a { color: var(--accent); font-weight: 600; text-decoration: none; margin-left: 4px; }
    }
    @media (max-width: 768px) {
      .auth-left { display: none; }
      .auth-right { width: 100%; }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';
  submitted = false;

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.submitted = true;
    if (!this.email || !this.password) return;
    this.loading = true;
    this.error = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        if (res.data.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.error = 'Email ou mot de passe incorrect';
        this.loading = false;
      }
    });
  }
}