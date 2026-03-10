import { Component, inject, computed, signal } from '@angular/core';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { GoalsService } from '../../services/goals.service';
import { TeamService } from '../../services/team.service';
import { SprintNotesService } from '../../services/sprint-notes.service';
import { AppIconComponent } from '../../shared/icons/app-icon.component';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-team-dashboard',
  standalone: true,
  imports: [AppIconComponent, DatePipe, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto p-6">
      <h2 class="text-2xl font-bold text-stone-800 mb-2 flex items-center gap-2">
        <app-icon name="chart" size="sm" class="text-red-600" />
        Dashboard de Eficácia
      </h2>
      <p class="text-stone-500 mb-6">Métricas da equipe TI no período.</p>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
          <p class="text-xs font-semibold text-stone-500 uppercase tracking-wider">Fechados (hoje)</p>
          <p class="text-2xl font-bold text-stone-800 mt-1">{{ metrics().closedToday }}</p>
        </div>
        <div class="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
          <p class="text-xs font-semibold text-stone-500 uppercase tracking-wider">Fechados (semana)</p>
          <p class="text-2xl font-bold text-blue-700 mt-1">{{ metrics().closedWeek }}</p>
        </div>
        <div class="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
          <p class="text-xs font-semibold text-stone-500 uppercase tracking-wider">Em andamento</p>
          <p class="text-2xl font-bold text-amber-700 mt-1">{{ metrics().inProgress }}</p>
        </div>
        <div class="bg-white rounded-xl border border-stone-200 p-4 shadow-sm">
          <p class="text-xs font-semibold text-stone-500 uppercase tracking-wider">Abertos</p>
          <p class="text-2xl font-bold text-stone-800 mt-1">{{ metrics().open }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
          <h3 class="font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <app-icon name="chart" size="sm" />
            Tickets por status (SVG)
          </h3>
          <div class="h-48 flex items-end justify-around gap-2 px-2">
            @for (bar of statusBars(); track bar.status) {
              <div class="flex flex-col items-center flex-1">
                <div class="w-full bg-stone-100 rounded-t flex flex-col justify-end min-h-[40px]" style="height: 120px;">
                  <div class="w-full rounded-t transition-all" [style.height.%]="bar.pct" [class]="bar.bgClass">
                  </div>
                </div>
                <span class="text-[10px] font-medium text-stone-600 mt-1 truncate w-full text-center">{{ bar.label }}</span>
                <span class="text-xs font-bold text-stone-800">{{ bar.count }}</span>
              </div>
            }
          </div>
        </div>
        <div class="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
          <h3 class="font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <app-icon name="target" size="sm" />
            Meta semanal
          </h3>
          @let goal = weeklyGoal();
          @if (goal) {
            <div class="flex justify-between items-center mb-2">
              <span class="text-stone-600">Equipe TI</span>
              <span class="font-bold" [class.text-emerald-600]="goal.currentValue >= goal.targetValue">{{ goal.currentValue }} / {{ goal.targetValue }}</span>
            </div>
            <div class="h-4 bg-stone-100 rounded-full overflow-hidden">
              <div class="h-full bg-red-500 rounded-full transition-all" [style.width.%]="goal.targetValue ? Math.min(100, (goal.currentValue / goal.targetValue) * 100) : 0"></div>
            </div>
          } @else {
            <p class="text-stone-500 text-sm">Nenhuma meta semanal.</p>
          }
        </div>
      </div>

      <div class="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
        <h3 class="font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <app-icon name="team" size="sm" />
          Por membro (mock)
        </h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-stone-200 text-left text-stone-500">
                <th class="pb-2 font-medium">Membro</th>
                <th class="pb-2 font-medium">Atribuídos</th>
                <th class="pb-2 font-medium">Fechados</th>
                <th class="pb-2 font-medium">Taxa</th>
              </tr>
            </thead>
            <tbody>
              @for (row of memberRows(); track row.name) {
                <tr class="border-b border-stone-100">
                  <td class="py-2 font-medium text-stone-800">{{ row.name }}</td>
                  <td class="py-2 text-stone-600">{{ row.assigned }}</td>
                  <td class="py-2 text-stone-600">{{ row.closed }}</td>
                  <td class="py-2">
                    <span class="font-medium" [class.text-emerald-600]="row.rate >= 0.7" [class.text-amber-600]="row.rate < 0.7 && row.rate > 0" [class.text-stone-500]="row.rate === 0">
                      {{ (row.rate * 100).toFixed(0) }}%
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p class="text-sm font-medium text-amber-800 flex items-center gap-2">
          <app-icon name="warning" size="sm" />
          Insights
        </p>
        <ul class="mt-2 text-sm text-amber-700 space-y-1">
          @for (insight of insights(); track insight) {
            <li>{{ insight }}</li>
          }
        </ul>
      </div>

      <div class="mt-6 bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
        <h3 class="font-semibold text-stone-800 mb-3">Retrospectiva / Notas de sprint</h3>
        <textarea [(ngModel)]="retroContent" placeholder="Registre pontos da retrospectiva..."
          class="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm resize-none h-24"></textarea>
        <button type="button" (click)="saveRetro()" class="mt-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
          Salvar nota
        </button>
        @if (sprintNotes().length) {
          <ul class="mt-4 space-y-2">
            @for (note of sprintNotes(); track note.id) {
              <li class="text-sm text-stone-600 border-l-2 border-stone-200 pl-3">
                {{ note.content }} <span class="text-stone-400 text-xs">({{ note.createdAt | date:'dd/MM HH:mm' }})</span>
              </li>
            }
          </ul>
        }
      </div>
    </div>
  `
})
export class TeamDashboardComponent {
  private ticketService = inject(TicketService);
  private authService = inject(AuthService);
  private goalsService = inject(GoalsService);
  private teamService = inject(TeamService);
  private sprintNotesService = inject(SprintNotesService);

  retroContent = '';
  sprintNotes = this.sprintNotesService.notes;

  saveRetro() {
    if (this.retroContent.trim()) {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      this.sprintNotesService.add({
        periodStart: weekStart,
        periodEnd: weekEnd,
        teamId: 'ti',
        content: this.retroContent.trim()
      });
      this.retroContent = '';
    }
  }

  metrics = computed(() => {
    const tickets = this.ticketService.tickets();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = todayStart - 7 * 86400000;
    return {
      closedToday: tickets.filter(t => t.status === 'done' && t.createdAt.getTime() >= todayStart).length,
      closedWeek: tickets.filter(t => t.status === 'done' && t.createdAt.getTime() >= weekStart).length,
      inProgress: tickets.filter(t => t.status === 'in-progress' || t.status === 'review').length,
      open: tickets.filter(t => t.status === 'todo' || t.status === 'backlog').length
    };
  });

  statusBars = computed(() => {
    const tickets = this.ticketService.tickets();
    const statuses = ['backlog', 'todo', 'in-progress', 'review', 'done'] as const;
    const counts = statuses.map(s => ({ status: s, count: tickets.filter(t => t.status === s).length }));
    const max = Math.max(1, ...counts.map(c => c.count));
    const labels: Record<string, string> = { backlog: 'Backlog', todo: 'A Fazer', 'in-progress': 'Fazendo', review: 'Review', done: 'Feito' };
    const classes: Record<string, string> = { backlog: 'bg-stone-400', todo: 'bg-stone-500', 'in-progress': 'bg-blue-500', review: 'bg-violet-500', done: 'bg-emerald-500' };
    return counts.map(c => ({
      status: c.status,
      count: c.count,
      label: labels[c.status],
      bgClass: classes[c.status],
      pct: max ? (c.count / max) * 100 : 0
    }));
  });

  weeklyGoal = computed(() => {
    const goals = this.goalsService.getOrCreateGoalsForPeriod('weekly', new Date(), this.authService.userName());
    return goals.find(g => g.scope === 'team');
  });

  memberRows = computed(() => {
    const team = this.teamService.getTeamById('ti');
    const tickets = this.ticketService.tickets();
    const names = team?.memberIds ?? [];
    return names.map(name => {
      const assigned = tickets.filter(t => t.assignee === name).length;
      const closed = tickets.filter(t => t.assignee === name && t.status === 'done').length;
      return {
        name,
        assigned,
        closed,
        rate: assigned > 0 ? closed / assigned : 0
      };
    });
  });

  insights = computed(() => {
    const m = this.metrics();
    const list: string[] = [];
    if (m.inProgress > 5) list.push('Há muitos tickets em andamento. Considere focar em conclusões.');
    if (m.open > 10) list.push('Fila de abertos alta. Priorize o backlog.');
    const goal = this.weeklyGoal();
    if (goal && goal.currentValue >= goal.targetValue * 0.8 && goal.currentValue < goal.targetValue) {
      list.push('Meta semanal em ' + Math.round((goal.currentValue / goal.targetValue) * 100) + '%. Quase lá.');
    }
    if (list.length === 0) list.push('Nenhum insight no momento.');
    return list;
  });
}
