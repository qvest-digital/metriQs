import {Component, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {JiraDataCenterService} from '../services/jira-data-center.service';
import {StorageService} from "../services/storage.service";
import {ToastrService} from "ngx-toastr";
import {WorkItemAgeChartComponent} from "./work-item-age-chart/work-item-age-chart.component";
import {AuthService} from "../services/auth.service";
import {WorkItemAgeService} from "../services/work-item-age.service";
import {JiraCloudService} from "../services/jira-cloud.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  imports: [
    FormsModule,
    WorkItemAgeChartComponent
  ],
  standalone: true
})
export class SettingsComponent {
  @ViewChild(WorkItemAgeChartComponent) workItemAgeChartComponent?: WorkItemAgeChartComponent;
  workItemAgeData: any;

  constructor(private jiraService: JiraDataCenterService,
              private jiraCloudService: JiraCloudService,
              private databaseService: StorageService, private toastr: ToastrService,
              private workItemAgeService: WorkItemAgeService) {
  }

  async loginToJira() {
    try {
      this.jiraCloudService.login();

      this.toastr.success('Successfully logged in to Jira');
    } catch (error) {
      this.toastr.error(error!.toString(), 'Failed to log in to Jira');
    }
  }

  loginToJiraDataCenter() {
    try {
      this.jiraService.login();

      this.toastr.success('Successfully logged in to Jira');
    } catch (error) {
      this.toastr.error(error!.toString(), 'Failed to log in to Jira');
    }
  }

  async fetchJiraIssues() {
    try {
      const issues = await this.jiraService.getIssues();

      await this.databaseService.addIssues(issues);
      const items = this.workItemAgeService.map2WorkItemAgeEntries(issues);
      await this.databaseService.addWorkItemAgeData(items);
      this.workItemAgeData = items;
      this.workItemAgeChartComponent?.loadData();
      this.workItemAgeChartComponent?.refreshChart();
      this.toastr.success('Successfully fetched issues from Jira');
    } catch (error) {
      this.toastr.error(error!.toString(), 'Failed to fetch issues from Jira');
    }
  }


}
