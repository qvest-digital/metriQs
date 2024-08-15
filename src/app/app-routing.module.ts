// src/app/app-routing.module.ts
import {RouterModule, Routes} from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import {WorkItemAgePage} from './components/work-item-age-page/work-item-age.page';
import {NgModule} from "@angular/core";
import {ManageDatasetsComponent} from "./components/manage-datasets/manage-datasets.component";
import {CallbackComponent} from "./components/callback.component";
import {CycleTimePage} from "./components/cycle-time-page/cycle-time.page";
import {EditDatasetComponent} from "./components/edit-dataset/edit-dataset.component";

export const CALLBACK_JIRA_CLOUD = 'callbackJiraCloud';
export const CALLBACK_JIRA_DATA_CENTER = 'callbackJiraDataCenter';
export const DASHBOARD = 'dashboard';
export const WORK_ITEM_AGE = 'work-item-age';
export const CYCLE_TIME = 'cycle-time';
export const MANAGE_DATASETS = 'manage-datasets';
export const EDIT_DATASET = 'edit-dataset';

export const routes: Routes = [
  {path: '', redirectTo: `/${DASHBOARD}`, pathMatch: 'full'},
  { path: CALLBACK_JIRA_CLOUD, component: CallbackComponent },
  { path: CALLBACK_JIRA_DATA_CENTER, component: CallbackComponent },
  {path: DASHBOARD, component: DashboardComponent},
  {path: WORK_ITEM_AGE, component: WorkItemAgePage},
  {path: CYCLE_TIME, component: CycleTimePage},
  {path: MANAGE_DATASETS, component: ManageDatasetsComponent},
  {path: EDIT_DATASET+ '/:id', component: EditDatasetComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: []
})
export class AppRoutingModule { }
