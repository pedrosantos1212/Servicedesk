import { Component, inject, computed } from '@angular/core';
import { TicketService } from '../../services/ticket.service';

@Component({
  selector: 'app-burndown',
  standalone: true,
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <h2 class="text-2xl font-bold text-stone-800 mb-2">Burndown</h2>
      <p class="text-stone-500 mb-6">Tickets abertos ao longo dos dias (últimos 7 dias).</p>

      <div class="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
        <svg [attr.viewBox]="'0 0 ' + svgWidth + ' ' + svgHeight" class="w-full h-64" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="rgb(239, 68, 68)" stop-opacity="0.3"/>
              <stop offset="100%" stop-color="rgb(239, 68, 68)" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <!-- Grid lines -->
          @for (i of [0,1,2,3,4]; track i) {
            <line [attr.x1]="padding" [attr.y1]="padding + i * chartHeight / 4" [attr.x2]="svgWidth - padding" [attr.y2]="padding + i * chartHeight / 4"
                  stroke="var(--tw-stone-200, #e7e5e4)" stroke-width="0.5"/>
          }
          @for (i of [0,1,2,3,4,5,6]; track i) {
            <line [attr.x1]="padding + i * chartWidth / 6" [attr.y1]="padding" [attr.x2]="padding + i * chartWidth / 6" [attr.y2]="svgHeight - padding"
                  stroke="var(--tw-stone-200, #e7e5e4)" stroke-width="0.5"/>
          }
          <!-- Ideal line (linear drop) -->
          <line [attr.x1]="padding" [attr.y1]="padding" [attr.x2]="svgWidth - padding" [attr.y2]="svgHeight - padding"
                stroke="#94a3b8" stroke-width="1" stroke-dasharray="4 2"/>
          <!-- Actual line (polyline) -->
          <polyline [attr.points]="actualPoints()" fill="none" stroke="rgb(239, 68, 68)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <!-- Area under actual -->
          <polygon [attr.points]="areaPoints()" fill="url(#lineGrad)"/>
          <!-- X labels -->
          @for (point of chartData(); track point.day) {
            <text [attr.x]="point.x" [attr.y]="svgHeight - padding + 16" text-anchor="middle" class="text-[10px] fill-stone-500">{{ point.label }}</text>
          }
        </svg>
        <div class="flex gap-6 mt-4 justify-center text-xs">
          <span class="flex items-center gap-1"><span class="w-4 h-0.5 bg-slate-400 inline-block" style="border-style: dashed;"></span> Ideal</span>
          <span class="flex items-center gap-1"><span class="w-4 h-0.5 bg-red-500 inline-block"></span> Real</span>
        </div>
      </div>
    </div>
  `
})
export class BurndownComponent {
  private ticketService = inject(TicketService);

  padding = 40;
  svgWidth = 500;
  svgHeight = 220;

  chartData = computed(() => {
    const tickets = this.ticketService.tickets();
    const openNow = tickets.filter(t => t.status !== 'done').length;
    const days: { day: string; open: number; label: string }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const open = i === 6 ? openNow : openNow + (6 - i) * 2;
      days.push({
        day: d.toISOString().slice(0, 10),
        open: Math.max(0, open),
        label: d.getDate() + '/' + (d.getMonth() + 1)
      });
    }
    const max = Math.max(1, ...days.map(d => d.open));
    const chartWidth = this.svgWidth - 2 * this.padding;
    const chartHeight = this.svgHeight - 2 * this.padding - 20;
    return days.map((d, i) => ({
      ...d,
      x: this.padding + (i / 6) * chartWidth,
      y: this.padding + (1 - d.open / max) * chartHeight,
      yBase: this.svgHeight - this.padding - 20
    }));
  });

  get chartWidth() { return this.svgWidth - 2 * this.padding; }
  get chartHeight() { return this.svgHeight - 2 * this.padding - 20; }

  actualPoints = computed(() => {
    const data = this.chartData();
    return data.map(d => d.x + ',' + d.y).join(' ');
  });

  areaPoints = computed(() => {
    const data = this.chartData();
    const base = this.svgHeight - this.padding - 20;
    const pts = data.map(d => d.x + ',' + d.y);
    const right = data[data.length - 1];
    const left = data[0];
    return (pts + ' ' + (right.x + ',' + base) + ' ' + (left.x + ',' + base)).trim();
  });
}
