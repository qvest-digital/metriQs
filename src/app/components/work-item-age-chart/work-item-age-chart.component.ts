import {Component, ViewChild} from '@angular/core';
import { StorageService } from "../../services/storage.service";
import { Issue } from "../../models/issue";
import { NgForOf } from "@angular/common";
import { BaseChartDirective } from "ng2-charts";
import {ChartConfiguration, ChartData, ChartType, TooltipItem} from 'chart.js';
import {WorkItemAgeService} from "../../services/work-item-age.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-work-item-age-chart',
  standalone: true,
  imports: [
    NgForOf,
    BaseChartDirective
  ],
  templateUrl: './work-item-age-chart.component.html',
  styleUrl: './work-item-age-chart.component.scss'
})
export class WorkItemAgeChartComponent {

  issues: Issue[] = [];
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public scatterChartType: ChartType = 'scatter';

  public scatterChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {

          label: function(context) {
            let label = context.dataset.label || '';

            if (label) {
              label += ': ';
            }

            if ((context.raw as any).issueKey) {
              label += `${(context.raw as any).issueKey}, `;
            }

            if (context.parsed.y !== null) {
              label += context.parsed.y + ' days';
            }
            return label;
          },
        }
      }
    }
  };

  public scatterChartData: ChartData<'scatter'> = {
    datasets: [
      {
        label: 'Work Item Age',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
      },
    ],
  };

  constructor(private databaseService: StorageService, private workItemService: WorkItemAgeService, private toasts: ToastrService) {}

  async loadData() {
    this.issues = await this.databaseService.getAllIssues();
    const items = this.workItemService.map2WorkItemAgeEntries(this.issues);
    // const data = await this.databaseService.addWorkItemAgeData(items);
    this.scatterChartData.datasets[0].data = items.map(item => ({
      x: item.age, // Assuming createdDate is a timestamp or date object
      y: item.age, // Assuming age is a numeric value representing the age of the work item
      issueKey: item.issueKey // Add issueKey to the data point
    }));
    this.chart?.update();
    this.toasts.success('Successfully loaded work item age data');

  }
}
