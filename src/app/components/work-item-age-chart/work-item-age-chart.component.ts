import { Component } from '@angular/core';
import {DatabaseService} from "../../services/database.service";
import {Issue} from "../../models/issue";
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-work-item-age-chart',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './work-item-age-chart.component.html',
  styleUrl: './work-item-age-chart.component.scss'
})
export class WorkItemAgeChartComponent {
  issues: Issue[] = [];
  constructor(private databaseService:DatabaseService) {}

  ngOnInit() {
  }


  async loadData() {
    this.issues = await this.databaseService.getWorkItemAgeData();
  }
}
