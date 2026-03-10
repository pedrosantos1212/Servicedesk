import { Injectable, signal } from '@angular/core';

export interface Team {
  id: string;
  name: string;
  memberIds: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private teamsSignal = signal<Team[]>([
    { id: 'ti', name: 'TI', memberIds: ['Técnico TI', 'João Silva', 'Maria Souza'] }
  ]);

  readonly teams = this.teamsSignal.asReadonly();

  getTeamById(id: string): Team | undefined {
    return this.teamsSignal().find(t => t.id === id);
  }

  isMember(teamId: string, userName: string): boolean {
    const team = this.getTeamById(teamId);
    return team?.memberIds.some(m => m === userName) ?? false;
  }
}
