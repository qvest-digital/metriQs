import { Component } from '@angular/core';
import {DatabaseService} from "../../services/database.service";
import {Issue} from "../../models/issue";
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-work-item-age-chart',
  standalone: true,
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './work-item-age-chart.component.html',
  styleUrl: './work-item-age-chart.component.scss'
})
export class WorkItemAgeChartComponent {
  issues: Issue[] = [];
  constructor(private databaseService:DatabaseService) {}


  async loadData() {
    this.issues = await this.databaseService.getWorkItemAgeData();
  }
}
