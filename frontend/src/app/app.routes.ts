import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { EquipmentListComponent } from './components/equipment-list/equipment-list';
import { EquipmentDetailComponent } from './components/equipment-detail/equipment-detail';
import { ParetoDashboardComponent } from './components/dashboard/pareto-dashboard';
import { CeAboDashboardComponent } from './components/ce-abo-dashboard/ce-abo-dashboard';

export const routes: Routes = [
  { path: '', redirectTo: '/pareto', pathMatch: 'full' },
  { path: 'pareto', component: ParetoDashboardComponent },
  { path: 'ce-abo', component: CeAboDashboardComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'equipment', component: EquipmentListComponent },
  { path: 'equipment/:id', component: EquipmentDetailComponent }
];

