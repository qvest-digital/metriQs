import {Component, Input, OnInit, ViewChild} from '@angular/core';
import { StorageService } from "../../services/storage.service";
import { NgForOf } from "@angular/common";
import { BaseChartDirective } from "ng2-charts";
import {Chart, ChartConfiguration, ChartData, ChartType, TooltipItem} from 'chart.js';
import {WorkItemAgeService} from "../../services/work-item-age.service";
import {ToastrService} from "ngx-toastr";
import annotationPlugin from 'chartjs-plugin-annotation';

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
export class WorkItemAgeChartComponent implements OnInit {
  @Input() workItemAgeData: any;

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public scatterChartType: ChartType = 'scatter';

  public scatterChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: false // Hide the legend
      },
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
            if ((context.raw as any).status) {
              label += `${(context.raw as any).status}, `;
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + ' days';
            }
            return label;
          },
        }
      },
      annotation: {
        annotations: {
          line1: {
            type: 'line',
            yMin: 18,
            yMax: 18,
            borderColor: 'red',
            borderWidth: 2,
            label: {
              content: 'SLE Threshold (80%)',
              position: 'center',
              display: true
            }
          }
        }
      }
    },
    scales: {
      x: {
        type: 'category', // Set the x-axis type to 'category' to handle string values
        display: true, // Show the x-axis scale
        ticks: {
          display: true // Show the x-axis ticks
        },
        title: {
          display: true,
          text: 'Status'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Age (days)'
        }
      }
    }
  };


  public scatterChartData: ChartData<'scatter', { x: string, y: number }[]> = {
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
        pointRadius: 10,
      },
    ],
  };

  constructor(private databaseService: StorageService, private workItemService: WorkItemAgeService, private toasts: ToastrService) {
    Chart.register(annotationPlugin);
  }

  async loadData() {
    const items = await this.databaseService.getWorkItemAgeData();
    items.sort((a, b) => a.issueId > b.issueId ? 1 : -1); // Sort items by issueId in descending order
    this.scatterChartData.datasets[0].data = items.map((item, index) => ({
      x: item.status,
      y: item.age, // Assuming age is a numeric value representing the age of the work item
      issueKey: item.issueKey, // Add issueKey to the data point
      status: item.status
    }));
    this.chart?.update();
    this.toasts.success('Successfully loaded work item age data');
  }

  refreshChart() {
    this.chart?.update();
  }

  ngOnInit(): void {
    this.loadData();
  }
}
