import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-left">
        <div class="auth-brand">
          <div class="brand-logo">💳</div>
          <h1>PayFlow</h1>
          <p>Rejoignez la plateforme de paiement numérique pour les PME</p>
        </div>
      </div>
      <div class="auth-right">
        <div class="auth-card">
          <h2>Créer un compte</h2>
          <p class="auth-subtitle">Commencez à utiliser PayFlow gratuitement</p>

          @if (error) {
            <div class="alert alert-error">{{ error }}</div>
          }

          <div class="form-group">
            <label>Nom complet</label>
            <input type="text" [(ngModel)]="fullName" placeholder="Ahmed Ould Mohamed"/>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" placeholder="votre@email.com"/>
          </div>
          <div class="form-group">
            <label>Téléphone</label>
            <input type="text" [(ngModel)]="phone" placeholder="222XXXXXXX"/>
          </div>
          <div class="form-group">
            <label>Mot de passe</label>
            <input type="password" [(ngModel)]="password" placeholder="••••••••"/>
          </div>

          <button class="btn btn-primary w-full" (click)="register()" [disabled]="loading">
            {{ loading ? 'Création...' : 'Créer mon compte' }}
          </button>

          <p class="auth-link">
            Déjà un compte ?
            <a routerLink="/auth/login">Se connecter</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display: flex; min-height: 100vh; }
    .auth-left {
      flex: 1; background: var(--primary);
      display: flex; flex-direction: column;
      justify-content: center; padding: 60px;
    }
    .auth-brand {
      .brand-logo { font-size: 3rem; margin-bottom: 16px; }
      h1 { color: white; font-size: 2.5rem; font-weight: 800; margin-bottom: 12px; }
      p { color: rgba(255,255,255,0.7); font-size: 1.1rem; line-height: 1.6; }
    }
    .auth-right {
      width: 480px; display: flex;
      align-items: center; justify-content: center;
      padding: 40px; background: var(--bg);
    }
    .auth-card {
      width: 100%; background: white;
      border-radius: 16px; padding: 40px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      h2 { font-size: 1.6rem; font-weight: 700; color: var(--primary); margin-bottom: 6px; }
    }
    .auth-subtitle { color: var(--text-muted); margin-bottom: 24px; font-size: 0.95rem; }
    .w-full { width: 100%; margin-top: 8px; padding: 12px; font-size: 1rem; }
    .auth-link {
      text-align: center; margin-top: 20px;
      color: var(--text-muted); font-size: 0.9rem;
      a { color: var(--accent); font-weight: 600; text-decoration: none; margin-left: 4px; }
    }
  `]
})
export class RegisterComponent {
  fullName = ''; email = ''; phone = ''; password = '';
  loading = false; error = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    if (!this.fullName || !this.email || !this.phone || !this.password) {
      this.error = 'Tous les champs sont obligatoires';
      return;
    }
    this.loading = true; this.error = '';
    this.authService.register({
      fullName: this.fullName, email: this.email,
      phone: this.phone, password: this.password
    }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = err.error?.error || 'Erreur lors de l\'inscription';
        this.loading = false;
      }
    });
  }
}