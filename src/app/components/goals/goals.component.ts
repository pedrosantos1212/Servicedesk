import { Component, inject, computed, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { GoalsService, Goal, PeriodType } from '../../services/goals.service';
import { AppIconComponent } from '../../shared/icons/app-icon.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [AppIconComponent, DatePipe],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <h2 class="text-2xl font-bold text-stone-800 mb-2 flex items-center gap-2">
        <app-icon name="target" size="sm" class="text-red-600" />
        Metas
      </h2>
      <p class="text-stone-500 mb-6">Acompanhe suas metas e da equipe por período.</p>

      <div class="flex flex-wrap gap-4 mb-6">
        <div class="flex items-center gap-2">
          <label for="period" class="text-sm font-medium text-stone-700">Período</label>
          <select id="period" [value]="periodType()" (change)="onPeriodChange($event)"
            class="px-3 py-2 border border-stone-300 rounded-lg bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-600">
            <option value="daily">Diária</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensal</option>
            <option value="quarterly">Trimestral</option>
            <option value="annual">Anual</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <label for="refDate" class="text-sm font-medium text-stone-700">Data ref.</label>
          <input id="refDate" type="date" [value]="refDateStr()" (input)="onRefDateChange($event)"
            class="px-3 py-2 border border-stone-300 rounded-lg bg-white text-stone-800">
        </div>
      </div>

      <div class="flex gap-2 mb-4 border-b border-stone-200">
        <button type="button" (click)="scopeFilter.set('user')"
          [class]="scopeFilter() === 'user' ? 'border-red-600 text-red-600 border-b-2 -mb-px font-medium' : 'text-stone-500 hover:text-stone-700'"
          class="px-4 py-2 text-sm transition-colors">
          Minhas metas
        </button>
        <button type="button" (click)="scopeFilter.set('team')"
          [class]="scopeFilter() === 'team' ? 'border-red-600 text-red-600 border-b-2 -mb-px font-medium' : 'text-stone-500 hover:text-stone-700'"
          class="px-4 py-2 text-sm transition-colors">
          Metas da equipe
        </button>
      </div>

      <div class="space-y-6">
        @for (goal of filteredGoals(); track goal.id) {
          <div class="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
            <div class="flex justify-between items-start mb-3">
              <div>
                <h3 class="font-semibold text-stone-800">
                  {{ goal.scope === 'user' ? 'Minha meta' : 'Meta da equipe TI' }} ({{ periodLabel(goal.periodType) }})
                </h3>
                <p class="text-xs text-stone-500 mt-0.5">
                  {{ goal.periodStart | date:'dd/MM/yyyy' }} - {{ goal.periodEnd | date:'dd/MM/yyyy' }}
                </p>
              </div>
              <span class="text-lg font-bold" [class.text-emerald-600]="goal.currentValue >= goal.targetValue" [class.text-stone-700]="goal.currentValue < goal.targetValue">
                {{ goal.currentValue }} / {{ goal.targetValue }}
              </span>
            </div>
            <div class="h-3 bg-stone-100 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-300"
                   [class.bg-emerald-500]="goal.currentValue >= goal.targetValue"
                   [class.bg-red-500]="goal.currentValue < goal.targetValue"
                   [style.width.%]="progressPercent(goal)">
              </div>
            </div>
            <p class="text-xs text-stone-500 mt-2">Chamados concluídos no período</p>
          </div>
        }
        @empty {
          <div class="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200 border-dashed">
            <app-icon name="target" size="lg" class="text-stone-400 mb-2" />
            <p class="text-stone-500 font-medium">Nenhuma meta para este período.</p>
          </div>
        }
      </div>
    </div>
  `
})
export class GoalsComponent {
  private goalsService = inject(GoalsService);
  private authService = inject(AuthService);

  periodType = signal<PeriodType>('weekly');
  refDate = signal<Date>(new Date());
  scopeFilter = signal<'user' | 'team'>('user');

  refDateStr = computed(() => {
    const d = this.refDate();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  });

  filteredGoals = computed(() => {
    const goals = this.goalsService.getOrCreateGoalsForPeriod(
      this.periodType(),
      this.refDate(),
      this.authService.userName()
    );
    const scope = this.scopeFilter();
    return goals.filter(g => g.scope === scope);
  });

  onPeriodChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.periodType.set(select.value as PeriodType);
  }

  onRefDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value) this.refDate.set(new Date(input.value));
  }

  progressPercent(goal: Goal): number {
    if (goal.targetValue <= 0) return 0;
    return Math.min(100, (goal.currentValue / goal.targetValue) * 100);
  }

  periodLabel(p: PeriodType): string {
    const map: Record<PeriodType, string> = {
      daily: 'Diária',
      weekly: 'Semanal',
      monthly: 'Mensal',
      quarterly: 'Trimestral',
      annual: 'Anual'
    };
    return map[p] ?? p;
  }
}
