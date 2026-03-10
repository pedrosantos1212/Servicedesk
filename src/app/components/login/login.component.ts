import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, UserRole } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { AppIconComponent } from '../../shared/icons/app-icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, AppIconComponent],
  template: `
    <div class="min-h-screen bg-stone-100 flex flex-col justify-center items-center p-4">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="bg-red-700 p-6 text-center">
          <h1 class="text-3xl font-bold text-white tracking-tight">Pirahy Alimentos</h1>
          <p class="text-red-100 mt-2 font-medium">Service Desk</p>
        </div>
        
        <div class="p-8">
          <h2 class="text-xl font-semibold text-stone-800 mb-6 text-center">Acesse o sistema</h2>
          
          <div class="space-y-4">
            <div>
              <label for="userName" class="block text-sm font-medium text-stone-600 mb-1">Seu Nome</label>
              <input id="userName" type="text" [(ngModel)]="userName" placeholder="Ex: João Silva" 
                class="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all">
            </div>

            <div class="pt-4 space-y-3">
              <p class="text-sm font-medium text-stone-600 text-center">Selecione seu perfil:</p>
              
              <button (click)="login('employee')" [disabled]="!userName.trim()"
                class="w-full flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-900 text-white py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <app-icon name="person" size="sm" />
                Sou Funcionário (Abrir Chamado)
              </button>
              
              <div class="grid grid-cols-2 gap-3">
                <button (click)="login('it-sistemas')" [disabled]="!userName.trim()"
                  class="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <app-icon name="computer" size="sm" />
                  TI - Sistemas
                </button>
                
                <button (click)="login('it-infra')" [disabled]="!userName.trim()"
                  class="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <app-icon name="router" size="sm" />
                  TI - Infra
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  userName = '';

  login(role: UserRole) {
    if (this.userName.trim()) {
      this.authService.login(role, this.userName.trim());
      if (role === 'employee') {
        this.router.navigate(['/employee']);
      } else {
        this.router.navigate(['/it']);
      }
    }
  }
}
