import { Injectable, signal } from '@angular/core';

export type TicketStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
export type TicketDepartment = 'sistemas' | 'infra';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  requester: string;
  department: TicketDepartment;
  status: TicketStatus;
  createdAt: Date;
  priority: TicketPriority;
  dueDate?: Date;
  assignee?: string;
  checklist: ChecklistItem[];
  templateId?: string;
}

export type TicketCreateInput = Omit<Ticket, 'id' | 'createdAt' | 'status'> & { checklistTemplateId?: string };

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private ticketsSignal = signal<Ticket[]>([
    {
      id: '1',
      title: 'Sistema ERP não abre',
      description: 'Ao tentar logar no ERP, a tela fica branca.',
      requester: 'João Silva',
      department: 'sistemas',
      status: 'todo',
      createdAt: new Date(Date.now() - 100000),
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000 * 2),
      checklist: []
    },
    {
      id: '2',
      title: 'Impressora sem papel',
      description: 'A impressora do setor financeiro está sem papel e piscando luz vermelha.',
      requester: 'Maria Souza',
      department: 'infra',
      status: 'in-progress',
      createdAt: new Date(Date.now() - 500000),
      priority: 'medium',
      assignee: 'Técnico TI',
      checklist: []
    },
    {
      id: '3',
      title: 'Acesso ao e-mail corporativo',
      description: 'Esqueci minha senha do e-mail.',
      requester: 'Carlos Pereira',
      department: 'infra',
      status: 'done',
      createdAt: new Date(Date.now() - 900000),
      priority: 'low',
      checklist: []
    },
    {
      id: '4',
      title: 'Nova impressora setor RH',
      description: 'Solicitação de nova impressora para o setor.',
      requester: 'Ana Costa',
      department: 'infra',
      status: 'backlog',
      createdAt: new Date(Date.now() - 86400000 * 3),
      priority: 'low',
      checklist: []
    },
    {
      id: '5',
      title: 'Ajuste relatório ERP',
      description: 'Relatório de vendas precisa de novo filtro por região.',
      requester: 'Pedro Lima',
      department: 'sistemas',
      status: 'review',
      createdAt: new Date(Date.now() - 86400000),
      priority: 'high',
      assignee: 'Técnico TI',
      checklist: []
    }
  ]);

  readonly tickets = this.ticketsSignal.asReadonly();

  addTicket(input: TicketCreateInput, checklistItems?: ChecklistItem[]) {
    const newTicket: Ticket = {
      ...input,
      id: Math.random().toString(36).substring(2, 9),
      status: 'todo',
      createdAt: new Date(),
      checklist: checklistItems ?? input.checklist ?? [],
      priority: input.priority ?? 'medium',
      dueDate: input.dueDate,
      assignee: input.assignee,
      templateId: input.checklistTemplateId
    };
    this.ticketsSignal.update(tickets => [...tickets, newTicket]);
  }

  updateTicketStatus(id: string, status: TicketStatus, assignee?: string) {
    this.ticketsSignal.update(tickets =>
      tickets.map(t => t.id === id ? { ...t, status, ...(assignee !== undefined && { assignee }) } : t)
    );
  }

  updateChecklistItem(ticketId: string, itemId: string, done: boolean) {
    this.ticketsSignal.update(tickets =>
      tickets.map(t => t.id === ticketId
        ? { ...t, checklist: t.checklist.map(i => i.id === itemId ? { ...i, done } : i) }
        : t
      )
    );
  }

  updateTicket(id: string, patch: Partial<Pick<Ticket, 'assignee' | 'priority' | 'dueDate' | 'title' | 'description'>>) {
    this.ticketsSignal.update(tickets =>
      tickets.map(t => t.id === id ? { ...t, ...patch } : t)
    );
  }
}
