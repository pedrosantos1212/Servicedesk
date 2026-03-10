import { Injectable, signal } from '@angular/core';

export interface SprintNote {
  id: string;
  periodStart: Date;
  periodEnd: Date;
  teamId: string;
  content: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SprintNotesService {
  private notesSignal = signal<SprintNote[]>([]);

  readonly notes = this.notesSignal.asReadonly();

  add(note: Omit<SprintNote, 'id' | 'createdAt'>) {
    this.notesSignal.update(notes => [...notes, {
      ...note,
      id: Math.random().toString(36).slice(2, 10),
      createdAt: new Date()
    }]);
  }

  getByPeriod(periodStart: Date, periodEnd: Date): SprintNote[] {
    const start = periodStart.getTime();
    const end = periodEnd.getTime();
    return this.notesSignal().filter(n =>
      n.periodStart.getTime() <= end && n.periodEnd.getTime() >= start
    );
  }
}
