import { Injectable, inject, computed, signal } from '@angular/core';
import { TicketService } from './ticket.service';
import { TeamService } from './team.service';

export type GoalScope = 'user' | 'team';
export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
export type GoalTargetType = 'tickets_closed' | 'tickets_created';

export interface Goal {
  id: string;
  scope: GoalScope;
  userId?: string;
  teamId?: string;
  periodType: PeriodType;
  periodStart: Date;
  periodEnd: Date;
  targetType: GoalTargetType;
  targetValue: number;
  currentValue: number;
}

@Injectable({
  providedIn: 'root'
})
export class GoalsService {
  private ticketService = inject(TicketService);
  private teamService = inject(TeamService);

  private goalsSignal = signal<Goal[]>([]);

  readonly goals = this.goalsSignal.asReadonly();

  private static getPeriodBounds(periodType: PeriodType, ref: Date): { start: Date; end: Date } {
    const start = new Date(ref);
    const end = new Date(ref);
    switch (periodType) {
      case 'daily':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      case 'weekly':
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        end.setTime(start.getTime());
        end.setDate(end.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      case 'monthly':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(start.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      case 'quarterly':
        const q = Math.floor(start.getMonth() / 3) + 1;
        start.setMonth((q - 1) * 3, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth((q - 1) * 3 + 3, 0);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      case 'annual':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(11, 31);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      default:
        return { start, end };
    }
  }

  getOrCreateGoalsForPeriod(periodType: PeriodType, ref: Date, userName: string): Goal[] {
    const { start, end } = GoalsService.getPeriodBounds(periodType, ref);
    const tickets = this.ticketService.tickets();
    const inRange = (d: Date) => d.getTime() >= start.getTime() && d.getTime() <= end.getTime();

    const userClosed = tickets.filter(t =>
      t.status === 'done' && inRange(t.createdAt) && t.assignee === userName
    ).length;
    const team = this.teamService.getTeamById('ti');
    const teamMembers = team?.memberIds ?? [];
    const teamClosed = tickets.filter(t =>
      t.status === 'done' && inRange(t.createdAt) && (t.assignee ? teamMembers.includes(t.assignee) : false)
    ).length;

    const userGoal: Goal = {
      id: `user-${periodType}-${ref.getTime()}`,
      scope: 'user',
      userId: userName,
      periodType,
      periodStart: start,
      periodEnd: end,
      targetType: 'tickets_closed',
      targetValue: periodType === 'daily' ? 3 : periodType === 'weekly' ? 15 : periodType === 'monthly' ? 50 : periodType === 'quarterly' ? 150 : 500,
      currentValue: userClosed
    };
    const teamGoal: Goal = {
      id: `team-${periodType}-${ref.getTime()}`,
      scope: 'team',
      teamId: 'ti',
      periodType,
      periodStart: start,
      periodEnd: end,
      targetType: 'tickets_closed',
      targetValue: periodType === 'daily' ? 10 : periodType === 'weekly' ? 40 : periodType === 'monthly' ? 120 : periodType === 'quarterly' ? 360 : 1200,
      currentValue: teamClosed
    };
    return [userGoal, teamGoal];
  }
}
