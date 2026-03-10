import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'pirahy-theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSignal = signal<Theme>(this.loadInitial());

  readonly theme = this.themeSignal.asReadonly();

  constructor() {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', this.themeSignal() === 'dark');
    }
    effect(() => {
      const t = this.themeSignal();
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', t === 'dark');
        try { localStorage.setItem(STORAGE_KEY, t); } catch (_) {}
      }
    });
  }

  private loadInitial(): Theme {
    if (typeof localStorage === 'undefined') return 'light';
    const s = localStorage.getItem(STORAGE_KEY);
    return s === 'dark' ? 'dark' : 'light';
  }

  toggle() {
    this.themeSignal.update(t => t === 'light' ? 'dark' : 'light');
  }

  set(theme: Theme) {
    this.themeSignal.set(theme);
  }
}
