// src/app/app-routing.module.ts
import {RouterModule, Routes} from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import {WorkItemAgePage} from './components/work-item-age-page/work-item-age.page';
import {NgModule} from "@angular/core";
import {DatasourceListComponent} from "./components/datasource/datasource-list.component";
import {CallbackComponent} from "./components/callback.component";
import {CycleTimePage} from "./components/cycle-time-page/cycle-time.page";
import {DatasourceEditComponent} from "./components/datasource/datasource-edit.component";
import {ThroughputPageComponent} from "./components/throughput-page/throughput-page.component";
import {WorkInProgressPageComponent} from "./components/work-in-progress/work-in-progress-page.component";

export const CALLBACK_JIRA_CLOUD = 'callbackJiraCloud';
export const CALLBACK_JIRA_DATA_CENTER = 'callbackJiraDataCenter';
export const DASHBOARD = 'dashboard';
export const WORK_ITEM_AGE = 'work-item-age';
export const CYCLE_TIME = 'cycle-time';
export const DATASOURCE_LIST = 'datasources';
export const DATASOURCE_CREATE = DATASOURCE_LIST + '/create';
export const THROUGHPUT = 'throughput';
export const WORK_IN_PROGRESS = 'work-in-progress';

export const routes: Routes = [
  {path: '', redirectTo: `/${DASHBOARD}`, pathMatch: 'full'},
  { path: CALLBACK_JIRA_CLOUD, component: CallbackComponent },
  { path: CALLBACK_JIRA_DATA_CENTER, component: CallbackComponent },
  {path: DASHBOARD, component: DashboardComponent},
  {path: WORK_ITEM_AGE, component: WorkItemAgePage},
  {path: THROUGHPUT, component: ThroughputPageComponent},
  {path: CYCLE_TIME, component: CycleTimePage},
  {path: DATASOURCE_LIST, component: DatasourceListComponent},
  {path: DATASOURCE_LIST + '/:id', component: DatasourceEditComponent},
  {path: DATASOURCE_CREATE, component: DatasourceEditComponent},
  {path: WORK_IN_PROGRESS, component: WorkInProgressPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: []
})
export class AppRoutingModule { }
