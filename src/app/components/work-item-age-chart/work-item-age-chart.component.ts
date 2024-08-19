import {Component, Input, OnInit, ViewChild, OnChanges, SimpleChanges} from '@angular/core';
import { BaseChartDirective } from "ng2-charts";
import {Chart, ChartConfiguration, ChartData, ChartType} from 'chart.js';
import {ChangeDetectorRef} from '@angular/core';
import annotationPlugin from 'chartjs-plugin-annotation';
import {WorkItemAgeEntry} from "../../models/workItemAgeEntry";
import {BusinessLogicService} from "../../services/business-logic.service";

@Component({
  selector: 'app-work-item-age-chart',
  standalone: true,
  imports: [
    BaseChartDirective
  ],
  templateUrl: './work-item-age-chart.component.html',
  styleUrl: './work-item-age-chart.component.scss'
})
export class WorkItemAgeChartComponent implements OnInit, OnChanges {
  @Input() workItemAgeData: WorkItemAgeEntry[] | undefined;

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
        },
        offset: true // Add space between the first entry and the Y-axis
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

  constructor(private cdr: ChangeDetectorRef, private businessLogicService: BusinessLogicService) {
    Chart.register(annotationPlugin);
  }

  ngOnInit(): void {
    this.updateChartData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workItemAgeData']) {
      this.updateChartData();
    }
  }

  updateChartData() {
    if (this.workItemAgeData) {
      this.scatterChartData.datasets[0].data = this.workItemAgeData.map((item: WorkItemAgeEntry) => ({
        x: item.status,
        y: item.age,
        issueKey: item.issueKey,
        status: item.status
      }));
      const percentilValue = this.businessLogicService.computePercentile(this.workItemAgeData.map(item => item.age), 80);
      this.updateAnnotationLine(percentilValue);

      this.chart?.update();
      this.cdr.detectChanges();
    }
  }

  updateChart() {
    this.chart?.update();
  }

  updateAnnotationLine(newValue: number) {
    // const line1: any = (this.scatterChartOptions!.plugins!.annotation!.annotations as any).line1;
    // if (line1) {
    (this.scatterChartOptions!.plugins!.annotation!.annotations as any).line1 = {
      type: 'line',
      yMin: newValue,
      yMax: newValue,
      borderColor: 'red',
      borderWidth: 2,
      label: {
        content: 'SLE Threshold (80%) = ' + newValue,
        position: 'center',
        display: true
      }
    }
    this.chart?.update();
    // }
  }
}
