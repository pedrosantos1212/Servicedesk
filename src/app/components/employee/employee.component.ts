import { Component, inject, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TicketService, TicketDepartment, TicketPriority } from '../../services/ticket.service';
import { ChecklistTemplateService } from '../../services/checklist-template.service';
import { AuthService } from '../../services/auth.service';
import { DatePipe } from '@angular/common';
import { AppIconComponent } from '../../shared/icons/app-icon.component';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, AppIconComponent],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-stone-800">Olá, {{ userName() }}</h2>
        <p class="text-stone-500">Como podemos ajudar você hoje?</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Form to create ticket -->
        <div class="md:col-span-1">
          <div class="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <h3 class="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <app-icon name="add-circle" size="sm" class="text-red-600" />
              Novo Chamado
            </h3>
            
            <form [formGroup]="ticketForm" (ngSubmit)="onSubmit()" class="space-y-4">
              <div>
                <label for="title" class="block text-sm font-medium text-stone-700 mb-1">Título resumido</label>
                <input id="title" type="text" formControlName="title" placeholder="Ex: Meu computador não liga"
                  class="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all">
              </div>

              <div>
                <label for="department" class="block text-sm font-medium text-stone-700 mb-1">Setor de TI</label>
                <select id="department" formControlName="department"
                  class="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all bg-white">
                  <option value="" disabled selected>Selecione o setor</option>
                  <option value="sistemas">Sistemas (ERP, Softwares, Acessos)</option>
                  <option value="infra">Infraestrutura (Computador, Internet, Impressora)</option>
                </select>
              </div>

              @if (ticketForm.get('department')?.value) {
                <div>
                  <label for="requestType" class="block text-sm font-medium text-stone-700 mb-1">Tipo de solicitação (checklist automático)</label>
                  <select id="requestType" formControlName="checklistTemplateId"
                    class="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all bg-white">
                    <option value="">Nenhum</option>
                    @for (tpl of checklistTemplates; track tpl.id) {
                      <option [value]="tpl.id">{{ tpl.name }}</option>
                    }
                  </select>
                </div>
              }

              <div>
                <label for="priority" class="block text-sm font-medium text-stone-700 mb-1">Prioridade</label>
                <select id="priority" formControlName="priority"
                  class="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all bg-white">
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div>
                <label for="dueDate" class="block text-sm font-medium text-stone-700 mb-1">Prazo desejado (opcional)</label>
                <input id="dueDate" type="date" formControlName="dueDate"
                  class="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all">
              </div>

              <div>
                <label for="description" class="block text-sm font-medium text-stone-700 mb-1">Descrição detalhada</label>
                <textarea id="description" formControlName="description" rows="4" placeholder="Descreva o problema com o máximo de detalhes..."
                  class="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none"></textarea>
              </div>

              <button type="submit" [disabled]="ticketForm.invalid"
                class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <app-icon name="send" size="sm" />
                Enviar Solicitação
              </button>
            </form>
          </div>
        </div>

        <!-- List of user's tickets -->
        <div class="md:col-span-2">
          <h3 class="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <app-icon name="history" size="sm" class="text-stone-600" />
            Meus Chamados
          </h3>
          
          <div class="space-y-4">
            @for (ticket of myTickets(); track ticket.id) {
              <div class="bg-white rounded-xl shadow-sm border border-stone-200 p-5 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start mb-2">
                  <h4 class="font-semibold text-stone-800 text-lg">{{ ticket.title }}</h4>
                  <span class="px-2.5 py-1 rounded-full text-xs font-medium border"
                    [class]="getStatusClass(ticket.status)">
                    {{ getStatusLabel(ticket.status) }}
                  </span>
                </div>
                <p class="text-stone-600 text-sm mb-4 line-clamp-2">{{ ticket.description }}</p>
                <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                  <div class="flex items-center gap-2">
                    <app-icon [name]="ticket.department === 'sistemas' ? 'computer' : 'router'" size="xs" />
                    <span class="capitalize">{{ ticket.department }}</span>
                    <span class="px-1.5 py-0.5 rounded text-[10px] font-medium" [class]="getPriorityClass(ticket.priority)">{{ getPriorityLabel(ticket.priority) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    @if (ticket.dueDate) {
                      <span class="flex items-center gap-1">
                        <app-icon name="calendar" size="xs" />
                        {{ ticket.dueDate | date:'dd/MM/yyyy' }}
                      </span>
                    }
                    <span class="flex items-center gap-1">
                      <app-icon name="schedule" size="xs" />
                      {{ ticket.createdAt | date:'dd/MM/yyyy HH:mm' }}
                    </span>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200 border-dashed">
                <app-icon name="inbox" size="lg" class="text-stone-400 mb-2" />
                <p class="text-stone-500 font-medium">Você ainda não abriu nenhum chamado.</p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class EmployeeComponent {
  private fb = inject(FormBuilder);
  private ticketService = inject(TicketService);
  private checklistTemplateService = inject(ChecklistTemplateService);
  private authService = inject(AuthService);

  userName = this.authService.userName;

  ticketForm = this.fb.group({
    title: ['', Validators.required],
    department: ['', Validators.required],
    checklistTemplateId: ['' as string],
    priority: ['medium' as TicketPriority, Validators.required],
    dueDate: [null as string | null],
    description: ['', Validators.required]
  });

  constructor() {
    this.ticketForm.get('department')?.valueChanges?.subscribe(() => {
      this.ticketForm.patchValue({ checklistTemplateId: '' }, { emitEvent: false });
    });
  }

  get checklistTemplates() {
    const dept = this.ticketForm.get('department')?.value as TicketDepartment | '';
    return this.checklistTemplateService.getTemplatesByDepartment(dept);
  }

  myTickets = computed(() => {
    const name = this.userName();
    return this.ticketService.tickets().filter(t => t.requester === name).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  });

  onSubmit() {
    if (this.ticketForm.valid) {
      const due = this.ticketForm.value.dueDate;
      const templateId = this.ticketForm.value.checklistTemplateId || undefined;
      const checklistItems = templateId
        ? this.checklistTemplateService.getChecklistForTemplate(templateId)
        : undefined;
      this.ticketService.addTicket({
        title: this.ticketForm.value.title!,
        description: this.ticketForm.value.description!,
        department: this.ticketForm.value.department as TicketDepartment,
        requester: this.userName(),
        priority: this.ticketForm.value.priority as TicketPriority,
        dueDate: due ? new Date(due) : undefined,
        checklist: [],
        checklistTemplateId: templateId
      }, checklistItems);
      this.ticketForm.reset({ department: '', checklistTemplateId: '', priority: 'medium', dueDate: null });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'backlog': return 'bg-stone-100 text-stone-600 border-stone-200';
      case 'todo': return 'bg-stone-100 text-stone-700 border-stone-200';
      case 'in-progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'review': return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'done': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'backlog': return 'Backlog';
      case 'todo': return 'Aguardando Atendimento';
      case 'in-progress': return 'Em Andamento';
      case 'review': return 'Em Revisão';
      case 'done': return 'Concluído';
      default: return status;
    }
  }

  getPriorityLabel(p: TicketPriority): string {
    switch (p) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      case 'urgent': return 'Urgente';
      default: return p;
    }
  }

  getPriorityClass(p: TicketPriority): string {
    switch (p) {
      case 'low': return 'bg-stone-100 text-stone-600';
      case 'medium': return 'bg-amber-50 text-amber-700';
      case 'high': return 'bg-orange-50 text-orange-700';
      case 'urgent': return 'bg-red-50 text-red-700';
      default: return 'bg-stone-100 text-stone-600';
    }
  }
}
