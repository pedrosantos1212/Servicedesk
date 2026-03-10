import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICONS } from './icons';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    @if (svgContent()) {
      <span class="inline-flex items-center justify-center [&>svg]:block" [class]="hostClass" [innerHTML]="svgContent()"></span>
    }
  `,
})
export class AppIconComponent {
  @Input() name: keyof typeof ICONS = 'ticket';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' = 'md';
  @Input() class = '';

  constructor(private sanitizer: DomSanitizer) {}

  get hostClass(): string {
    const sizeMap = { xs: 'w-3.5 h-3.5', sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
    return `${sizeMap[this.size]} ${this.class}`.trim();
  }

  svgContent(): SafeHtml | null {
    const path = ICONS[this.name];
    if (!path) return null;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-full h-full" fill="currentColor" aria-hidden="true">${path}</svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}
