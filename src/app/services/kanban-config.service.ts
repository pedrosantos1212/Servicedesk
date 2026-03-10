import { Injectable } from '@angular/core';
import { TicketStatus } from './ticket.service';

export interface KanbanColumn {
  id: TicketStatus;
  label: string;
  wipLimit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class KanbanConfigService {
  readonly columns: KanbanColumn[] = [
    { id: 'backlog', label: 'Backlog', wipLimit: undefined },
    { id: 'todo', label: 'A Fazer', wipLimit: undefined },
    { id: 'in-progress', label: 'Em Andamento', wipLimit: 3 },
    { id: 'review', label: 'Review', wipLimit: 2 },
    { id: 'done', label: 'Concluído', wipLimit: undefined }
  ];

  getColumnIds(): TicketStatus[] {
    return this.columns.map(c => c.id);
  }

  getConnectedIds(excludeId: TicketStatus): string[] {
    return this.columns.filter(c => c.id !== excludeId).map(c => c.id + 'List');
  }
}
