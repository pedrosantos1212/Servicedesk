import {Routes} from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { EmployeeComponent } from './components/employee/employee.component';
import { ItDashboardComponent } from './components/it-dashboard/it-dashboard.component';
import { GoalsComponent } from './components/goals/goals.component';
import { TeamDashboardComponent } from './components/team-dashboard/team-dashboard.component';
import { BurndownComponent } from './components/burndown/burndown.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'employee', component: EmployeeComponent },
  { path: 'it', component: ItDashboardComponent },
  { path: 'goals', component: GoalsComponent },
  { path: 'dashboard', component: TeamDashboardComponent },
  { path: 'burndown', component: BurndownComponent },
  { path: '**', redirectTo: '' }
];
