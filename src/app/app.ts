import {ChangeDetectionStrategy, Component, inject, signal, HostListener} from '@angular/core';
import {RouterOutlet, Router, RouterLink, RouterLinkActive} from '@angular/router';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { AppIconComponent } from './shared/icons/app-icon.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AppIconComponent],
  template: `
    <div class="min-h-screen bg-stone-50 dark:bg-stone-900 font-sans text-stone-900 dark:text-stone-100">
      @if (authService.role() !== null) {
        <nav class="bg-red-700 text-white shadow-md sticky top-0 z-50">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16 items-center">
              <div class="flex items-center gap-6">
                <a [routerLink]="isEmployee() ? '/employee' : '/it'" class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-white rounded flex items-center justify-center text-red-700">
                    <app-icon name="support-agent" size="sm" />
                  </div>
                  <span class="font-bold text-xl tracking-tight">Pirahy Service Desk</span>
                </a>
                @if (isEmployee()) {
                  <a routerLink="/employee" routerLinkActive="bg-red-600" [routerLinkActiveOptions]="{ exact: false }"
                     class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-100 hover:bg-red-600 hover:text-white text-sm font-medium transition-colors">
                    <app-icon name="ticket" size="xs" />
                    Solicitações
                  </a>
                  <a routerLink="/goals" routerLinkActive="bg-red-600"
                     class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-100 hover:bg-red-600 hover:text-white text-sm font-medium transition-colors">
                    <app-icon name="target" size="xs" />
                    Metas
                  </a>
                }
                @if (isIT()) {
                  <a routerLink="/it" routerLinkActive="bg-red-600" [routerLinkActiveOptions]="{ exact: true }"
                     class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-100 hover:bg-red-600 hover:text-white text-sm font-medium transition-colors">
                    <app-icon name="board" size="xs" />
                    Painel
                  </a>
                  <a routerLink="/dashboard" routerLinkActive="bg-red-600"
                     class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-100 hover:bg-red-600 hover:text-white text-sm font-medium transition-colors">
                    <app-icon name="chart" size="xs" />
                    Dashboard
                  </a>
                  <a routerLink="/goals" routerLinkActive="bg-red-600"
                     class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-100 hover:bg-red-600 hover:text-white text-sm font-medium transition-colors">
                    <app-icon name="target" size="xs" />
                    Metas
                  </a>
                  <a routerLink="/burndown" routerLinkActive="bg-red-600"
                     class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-100 hover:bg-red-600 hover:text-white text-sm font-medium transition-colors">
                    <app-icon name="trending" size="xs" />
                    Burndown
                  </a>
                }
              </div>
              
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-2 text-red-100 text-sm">
                  <app-icon name="account-circle" size="sm" />
                  <span class="font-medium">{{ authService.userName() }}</span>
                  <span class="opacity-75 text-xs bg-red-800 px-2 py-0.5 rounded-full ml-1">
                    {{ getRoleLabel() }}
                  </span>
                </div>
                
                <button type="button" (click)="themeService.toggle()" class="p-2 rounded-lg text-red-100 hover:bg-red-600 hover:text-white transition-colors" [attr.aria-label]="themeService.theme() === 'dark' ? 'Modo claro' : 'Modo escuro'">
                  @if (themeService.theme() === 'light') {
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M12 3a9 9 0 1 0 9 9c-.5 0-1-.05-1.5-.15a6 6 0 0 1-4.3-4.3C14.05 11 14 10.5 14 10a6 6 0 0 1 6-6c0-.5-.05-1-.15-1.5a6 6 0 0 1-4.3-4.3C15 4 14.5 3.95 14 4a9 9 0 0 0-2 0z"/></svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2v2a8 8 0 1 0 0 16v2a10 10 0 0 1 0-20z"/></svg>
                  }
                </button>
                <button (click)="logout()" 
                  class="flex items-center gap-1 text-red-100 hover:text-white hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium">
                  <app-icon name="logout" size="sm" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </nav>
      }
      @if (showShortcuts()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" (click)="showShortcuts.set(false)">
          <div class="bg-white dark:bg-stone-800 rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 border border-stone-200 dark:border-stone-600" (click)="$event.stopPropagation()">
            <h3 class="font-semibold text-stone-800 dark:text-stone-100 mb-3">Atalhos</h3>
            <ul class="text-sm text-stone-600 dark:text-stone-300 space-y-2">
              <li><kbd class="px-1.5 py-0.5 bg-stone-100 dark:bg-stone-700 rounded text-xs font-mono">N</kbd> Novo chamado (na tela do funcionário)</li>
              <li><kbd class="px-1.5 py-0.5 bg-stone-100 dark:bg-stone-700 rounded text-xs font-mono">?</kbd> Mostrar atalhos</li>
            </ul>
            <button type="button" (click)="showShortcuts.set(false)" class="mt-4 w-full py-2 bg-stone-200 dark:bg-stone-600 rounded-lg text-sm font-medium hover:bg-stone-300 dark:hover:bg-stone-500">Fechar</button>
          </div>
        </div>
      }
      
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class App {
  authService = inject(AuthService);
  private router = inject(Router);
  themeService = inject(ThemeService);
  showShortcuts = signal(false);

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (e.key === '?') {
      this.showShortcuts.set(true);
      e.preventDefault();
    }
    if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const url = this.router.url;
      if (url.startsWith('/employee')) {
        const el = document.querySelector<HTMLInputElement>('#title');
        if (el) { el.focus(); e.preventDefault(); }
      }
    }
  }
    return this.authService.role() === 'employee';
  }
  isIT(): boolean {
    const r = this.authService.role();
    return r === 'it-sistemas' || r === 'it-infra';
  }

  getRoleLabel(): string {
    const role = this.authService.role();
    if (role === 'employee') return 'Funcionário';
    if (role === 'it-sistemas') return 'TI Sistemas';
    if (role === 'it-infra') return 'TI Infra';
    return '';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
