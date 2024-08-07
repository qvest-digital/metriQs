import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JiraService } from '../services/jira.service';
import {StorageService} from "../services/storage.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  imports: [
    FormsModule
  ],
  standalone: true
})
export class SettingsComponent {

  constructor(private jiraService: JiraService, private databaseService: StorageService, private toastr: ToastrService) {}

  async fetchJiraIssues() {
    try {
      const issues = await this.jiraService.getIssues();

      await this.databaseService.addIssues(issues);

      this.toastr.success('Successfully fetched issues from Jira');
    } catch (error) {
      this.toastr.error(error!.toString(),'Failed to fetch issues from Jira');
    }
  }
}
