import { Component, inject, computed, signal } from '@angular/core';
import { TicketService, Ticket, TicketStatus, TicketPriority } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { KanbanConfigService } from '../../services/kanban-config.service';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { AppIconComponent } from '../../shared/icons/app-icon.component';

type DueFilter = 'all' | 'overdue' | 'today' | 'week';

@Component({
  selector: 'app-it-dashboard',
  standalone: true,
  imports: [DragDropModule, DatePipe, NgTemplateOutlet, AppIconComponent],
  template: `
    <div class="h-[calc(100vh-64px)] flex flex-col p-6 overflow-hidden">
      <div class="mb-4 flex flex-wrap justify-between items-end gap-4">
        <div>
          <h2 class="text-2xl font-bold text-stone-800">Painel de Atendimento</h2>
          <p class="text-stone-500 flex items-center gap-2 mt-1">
            <app-icon [name]="isSistemas() ? 'computer' : 'router'" size="sm" />
            Equipe de {{ isSistemas() ? 'Sistemas' : 'Infraestrutura' }}
          </p>
        </div>
        <div class="flex gap-2 flex-wrap">
          <button type="button" (click)="dueFilter.set('all')"
            [class]="dueFilter() === 'all' ? 'bg-stone-700 text-white' : 'bg-white text-stone-600 hover:bg-stone-100'"
            class="px-3 py-1.5 rounded-lg text-xs font-medium border border-stone-200 transition-colors">
            Todos
          </button>
          <button type="button" (click)="dueFilter.set('overdue')"
            [class]="dueFilter() === 'overdue' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-600 hover:bg-red-50 border-red-200'"
            class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors">
            Atrasados
          </button>
          <button type="button" (click)="dueFilter.set('today')"
            [class]="dueFilter() === 'today' ? 'bg-amber-600 text-white' : 'bg-white text-amber-700 hover:bg-amber-50 border-amber-200'"
            class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors">
            Vencem hoje
          </button>
          <button type="button" (click)="dueFilter.set('week')"
            [class]="dueFilter() === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50 border-blue-200'"
            class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors">
            Esta semana
          </button>
        </div>
        <div class="flex gap-2 flex-wrap">
          @for (col of kanbanColumns; track col.id) {
            <div class="bg-white px-3 py-1.5 rounded-lg shadow-sm border border-stone-200 flex flex-col items-center">
              <span class="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">{{ col.label }}</span>
              <span class="text-lg font-bold" [class]="columnCountClass(col.id)">{{ ticketsByStatus()[col.id].length }}</span>
              @if (col.wipLimit) {
                <span class="text-[10px] text-stone-400">máx {{ col.wipLimit }}</span>
              }
            </div>
          }
        </div>
      </div>

      <!-- Kanban Board -->
      <div class="flex-1 flex gap-4 overflow-x-auto pb-4 min-w-0">
        @for (col of kanbanColumns; track col.id) {
          <div class="flex-1 min-w-[280px] max-w-[320px] flex flex-col rounded-2xl border flex-shrink-0" [class]="columnBgClass(col.id)">
            <div class="p-3 border-b rounded-t-2xl flex items-center justify-between" [class]="columnHeaderClass(col.id)">
              <h3 class="font-semibold text-sm flex items-center gap-2" [class]="columnTitleClass(col.id)">
                <span class="w-2 h-2 rounded-full shrink-0" [class]="columnDotClass(col.id)"></span>
                {{ col.label }}
              </h3>
              <span class="text-xs font-bold px-2 py-0.5 rounded-full" [class]="columnBadgeClass(col.id)">{{ ticketsByStatus()[col.id].length }}{{ col.wipLimit ? '/' + col.wipLimit : '' }}</span>
            </div>
            <div class="flex-1 p-2 overflow-y-auto min-h-0"
                 cdkDropList
                 [id]="col.id + 'List'"
                 [cdkDropListData]="ticketsByStatus()[col.id]"
                 [cdkDropListConnectedTo]="connectedIds(col.id)"
                 (cdkDropListDropped)="drop($event, col.id)">
              @for (ticket of ticketsByStatus()[col.id]; track ticket.id) {
                <div cdkDrag class="bg-white p-3 rounded-xl shadow-sm border mb-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                     [class.opacity-75]="col.id === 'done'"
                     [class.hover:opacity-100]="col.id === 'done'">
                  <ng-container *ngTemplateOutlet="ticketCard; context: { $implicit: ticket }"></ng-container>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Reusable Ticket Card Template -->
    <ng-template #ticketCard let-ticket>
      <div class="flex justify-between items-start mb-2 gap-2">
        <h4 class="font-semibold text-stone-800 text-sm leading-tight">{{ ticket.title }}</h4>
        <span class="text-[10px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded shrink-0">#{{ ticket.id }}</span>
      </div>
      <div class="flex flex-wrap items-center gap-1.5 mb-2">
        <span class="text-[10px] font-medium px-1.5 py-0.5 rounded" [class]="priorityClass(ticket.priority)">{{ priorityLabel(ticket.priority) }}</span>
        @if (ticket.dueDate) {
          <span class="flex items-center gap-0.5 text-[10px]" [class.text-red-600]="dueState(ticket) === 'overdue'">
            <app-icon name="calendar" size="xs" />
            {{ ticket.dueDate | date:'dd/MM' }}
          </span>
          @if (dueState(ticket) === 'overdue') {
            <span class="text-[10px] font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Atrasado</span>
          } @else if (dueState(ticket) === 'soon') {
            <span class="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Prazo próximo</span>
          }
        }
      </div>
      @if (ticket.checklist.length > 0) {
        <div class="mb-2">
          <button type="button" (click)="toggleCardExpand(ticket.id)" class="flex items-center gap-1 text-[10px] text-stone-500 hover:text-stone-700">
            <app-icon name="checklist" size="xs" />
            {{ ticket.checklist.filter(c => c.done).length }}/{{ ticket.checklist.length }}
          </button>
          @if (expandedCardId() === ticket.id) {
            <div class="mt-1 space-y-1 pl-3 border-l-2 border-stone-200">
              @for (item of ticket.checklist; track item.id) {
                <label class="flex items-center gap-2 text-[10px] cursor-pointer" [class.line-through]="item.done" [class.text-stone-400]="item.done">
                  <input type="checkbox" [checked]="item.done" (change)="toggleChecklistItem(ticket.id, item.id, !item.done)" class="rounded border-stone-300">
                  {{ item.label }}
                </label>
              }
            </div>
          }
        </div>
      }
      <p class="text-stone-600 text-xs mb-4 line-clamp-3">{{ ticket.description }}</p>
      
      <div class="flex items-center justify-between mt-auto pt-3 border-t border-stone-100">
        <div class="flex items-center gap-1.5">
          <div class="w-6 h-6 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold shrink-0">
            {{ ticket.requester.charAt(0).toUpperCase() }}
          </div>
          <span class="text-xs font-medium text-stone-600 truncate max-w-[80px]">{{ ticket.requester }}</span>
          @if (ticket.assignee) {
            <span class="text-[10px] text-stone-400 truncate max-w-[60px]" title="Responsável: {{ ticket.assignee }}">{{ ticket.assignee }}</span>
          }
        </div>
        <div class="flex items-center gap-1 text-stone-400 text-[10px] font-medium shrink-0">
          <app-icon name="schedule" size="xs" />
          {{ ticket.createdAt | date:'dd/MM HH:mm' }}
        </div>
      </div>
    </ng-template>
  `
})
export class ItDashboardComponent {
  private ticketService = inject(TicketService);
  private authService = inject(AuthService);
  private kanbanConfig = inject(KanbanConfigService);

  kanbanColumns = this.kanbanConfig.columns;
  dueFilter = signal<DueFilter>('all');
  expandedCardId = signal<string | null>(null);

  isSistemas = computed(() => this.authService.role() === 'it-sistemas');
  
  private matchDue(t: Ticket): boolean {
    const due = t.dueDate;
    if (!due) return this.dueFilter() === 'all';
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const msPerDay = 86400000;
    const daysUntil = (dueDay.getTime() - today.getTime()) / msPerDay;
    switch (this.dueFilter()) {
      case 'all': return true;
      case 'overdue': return daysUntil < 0;
      case 'today': return daysUntil === 0;
      case 'week': return daysUntil >= 0 && daysUntil <= 7;
      default: return true;
    }
  }

  departmentTickets = computed(() => {
    const dept = this.isSistemas() ? 'sistemas' : 'infra';
    const list = this.ticketService.tickets().filter(t => t.department === dept);
    if (this.dueFilter() === 'all') return list;
    return list.filter(t => this.matchDue(t));
  });

  ticketsByStatus = computed(() => {
    const d = this.departmentTickets();
    const sort = (a: Ticket, b: Ticket) => b.createdAt.getTime() - a.createdAt.getTime();
    const out: Record<TicketStatus, Ticket[]> = {
      backlog: d.filter(t => t.status === 'backlog').sort(sort),
      todo: d.filter(t => t.status === 'todo').sort(sort),
      'in-progress': d.filter(t => t.status === 'in-progress').sort(sort),
      review: d.filter(t => t.status === 'review').sort(sort),
      done: d.filter(t => t.status === 'done').sort(sort)
    };
    return out;
  });

  connectedIds(excludeStatus: TicketStatus): string[] {
    return this.kanbanConfig.getConnectedIds(excludeStatus);
  }

  columnBgClass(status: TicketStatus): string {
    const map: Record<TicketStatus, string> = {
      backlog: 'bg-stone-100/50 border-stone-200',
      todo: 'bg-stone-100/50 border-stone-200',
      'in-progress': 'bg-blue-50/30 border-blue-100',
      review: 'bg-violet-50/30 border-violet-100',
      done: 'bg-emerald-50/30 border-emerald-100'
    };
    return map[status] ?? 'bg-stone-100/50 border-stone-200';
  }
  columnHeaderClass(status: TicketStatus): string {
    const map: Record<TicketStatus, string> = {
      backlog: 'border-stone-200 bg-stone-100/80',
      todo: 'border-stone-200 bg-stone-100/80',
      'in-progress': 'border-blue-100 bg-blue-50/50',
      review: 'border-violet-100 bg-violet-50/50',
      done: 'border-emerald-100 bg-emerald-50/50'
    };
    return map[status] ?? 'border-stone-200 bg-stone-100/80';
  }
  columnTitleClass(status: TicketStatus): string {
    const map: Record<TicketStatus, string> = {
      backlog: 'text-stone-600',
      todo: 'text-stone-700',
      'in-progress': 'text-blue-800',
      review: 'text-violet-800',
      done: 'text-emerald-800'
    };
    return map[status] ?? 'text-stone-700';
  }
  columnDotClass(status: TicketStatus): string {
    const map: Record<TicketStatus, string> = {
      backlog: 'bg-stone-400',
      todo: 'bg-stone-400',
      'in-progress': 'bg-blue-500 animate-pulse',
      review: 'bg-violet-500',
      done: 'bg-emerald-500'
    };
    return map[status] ?? 'bg-stone-400';
  }
  columnBadgeClass(status: TicketStatus): string {
    const map: Record<TicketStatus, string> = {
      backlog: 'bg-stone-200 text-stone-600',
      todo: 'bg-stone-200 text-stone-600',
      'in-progress': 'bg-blue-100 text-blue-700',
      review: 'bg-violet-100 text-violet-700',
      done: 'bg-emerald-100 text-emerald-700'
    };
    return map[status] ?? 'bg-stone-200 text-stone-600';
  }
  columnCountClass(status: TicketStatus): string {
    const map: Record<TicketStatus, string> = {
      backlog: 'text-stone-800',
      todo: 'text-stone-800',
      'in-progress': 'text-blue-700',
      review: 'text-violet-700',
      done: 'text-emerald-700'
    };
    return map[status] ?? 'text-stone-800';
  }

  dueState(ticket: Ticket): 'overdue' | 'soon' | null {
    const due = ticket.dueDate;
    if (!due) return null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const msPerDay = 86400000;
    const daysUntil = (dueDay.getTime() - today.getTime()) / msPerDay;
    if (daysUntil < 0) return 'overdue';
    if (daysUntil <= 2) return 'soon';
    return null;
  }

  priorityLabel(p: TicketPriority): string {
    switch (p) { case 'low': return 'Baixa'; case 'medium': return 'Média'; case 'high': return 'Alta'; case 'urgent': return 'Urgente'; default: return p; }
  }
  priorityClass(p: TicketPriority): string {
    switch (p) { case 'low': return 'bg-stone-100 text-stone-600'; case 'medium': return 'bg-amber-50 text-amber-700'; case 'high': return 'bg-orange-50 text-orange-700'; case 'urgent': return 'bg-red-50 text-red-700'; default: return 'bg-stone-100 text-stone-600'; }
  }

  toggleCardExpand(ticketId: string) {
    this.expandedCardId.update(id => id === ticketId ? null : ticketId);
  }

  toggleChecklistItem(ticketId: string, itemId: string, done: boolean) {
    this.ticketService.updateChecklistItem(ticketId, itemId, done);
  }

  drop(event: CdkDragDrop<Ticket[]>, newStatus: TicketStatus) {
    if (event.previousContainer === event.container) {
      // Reordering within the same list (optional, requires state update to persist order)
      // moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const ticket = event.previousContainer.data[event.previousIndex];
      const assignee = newStatus === 'in-progress' ? this.authService.userName() : undefined;
      this.ticketService.updateTicketStatus(ticket.id, newStatus, assignee);
    }
  }
}
