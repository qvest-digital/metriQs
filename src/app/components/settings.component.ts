import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JiraService } from '../services/jira.service';
import {DatabaseService} from "../services/database.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  imports: [
    FormsModule
  ],
  standalone: true
})
export class SettingsComponent {

  constructor(private jiraService: JiraService, private databaseService: DatabaseService) {}

  async fetchJiraIssues() {
    try {
      const issues = await this.jiraService.getIssues();
      await this.databaseService.addIssues(issues);
      console.log(issues);
    } catch (error) {
      console.error(error);
    }
  }
}
