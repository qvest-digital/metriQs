import {RouterModule, Routes} from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SettingsComponent } from './components/settings.component';
import {NgModule} from "@angular/core";
import {ManageDatasetsComponent} from "./components/manage-datasets/manage-datasets.component";
import {JiraCloudService} from "./services/jira-cloud.service";
import {JiraDataCenterService} from "./services/jira-data-center.service";

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'callback', component: JiraCloudService },
  { path: 'callbackJiraDataCenter', component: JiraDataCenterService },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'manage-datasets', component: ManageDatasetsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: []
})
export class AppRoutingModule { }
