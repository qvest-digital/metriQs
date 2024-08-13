import {RouterModule, Routes} from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SettingsComponent } from './components/settings.component';
import {NgModule} from "@angular/core";
import {ManageDatasetsComponent} from "./components/manage-datasets/manage-datasets.component";
import {JiraCloudService} from "./services/jira-cloud.service";
import {JiraDataCenterService} from "./services/jira-data-center.service";
import {CallbackComponent} from "./components/callback.component";

export const CALLBACK_JIRA_CLOUD = 'callbackJiraCloud';
export const CALLBACK_JIRA_DATA_CENTER = 'callbackJiraDataCenter';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: CALLBACK_JIRA_CLOUD, component: CallbackComponent },
  { path: CALLBACK_JIRA_DATA_CENTER, component: CallbackComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'manage-datasets', component: ManageDatasetsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: []
})
export class AppRoutingModule { }
