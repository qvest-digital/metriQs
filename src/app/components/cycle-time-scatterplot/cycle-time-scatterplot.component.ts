import {Component, Input, ViewChild} from '@angular/core';
import {Chart, ChartConfiguration, ChartData, ChartType} from 'chart.js';
import {BaseChartDirective} from "ng2-charts";
import {ToastrService} from "ngx-toastr";
import annotationPlugin from 'chartjs-plugin-annotation';
import {StorageService} from "../../services/storage.service";
import {BusinessLogicService} from "../../services/business-logic.service";

@Component({
  selector: 'app-cycle-time-scatterplot',
  standalone: true,
  imports: [
    BaseChartDirective
  ],
  templateUrl: './cycle-time-scatterplot.component.html',
  styleUrl: './cycle-time-scatterplot.component.scss'
})
export class CycleTimeScatterplotComponent {
  percentilValue = 23;

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
            yMin: 0,
            yMax: 0,
            borderColor: 'red',
            borderWidth: 1,
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
        display: true, // Hide the x-axis scale
        ticks: {
          display: false // Hide the x-axis ticks
        },
        title: {
          display: false,
        }
      },
      y: {
        title: {
          display: true,
          text: 'cycletime (days)'
        }
      }
    }
  };

  public scatterChartData: ChartData<'scatter'> = {
    datasets: [
      {
        label: 'Cycle Time',
        data: [],
        pointRadius: 10,
      },
    ],
  };

  constructor(private databaseService: StorageService, private businessLogicService: BusinessLogicService, private toasts: ToastrService) {
    Chart.register(annotationPlugin);
  }

  async loadData() {
    const items = await this.databaseService.getCycleTimeData();
    items.sort((a, b) => a.issueId > b.issueId ? 1 : -1); // Sort items by issueId in descending order
    this.percentilValue = this.businessLogicService.computePercentile(items.map(item => item.cycleTime), 80);
    this.updateAnnotationLine(this.percentilValue);
    this.scatterChartData.datasets[0].data = items.map((item, index) => ({
      x: index,
      y: item.cycleTime, // Assuming age is a numeric value representing the age of the work item
      issueKey: item.issueKey // Add issueKey to the data point
    }));

    this.chart?.update();
    this.toasts.success('Successfully loaded cycle time data');
  }

  refreshChart() {
    this.chart?.update();
  }

  ngOnInit(): void {
    this.loadData();
  }

  updateAnnotationLine(newValue: number) {
    if (this.chart && this.chart.options && this.chart.options.plugins && this.chart.options.plugins.annotation) {
      const annotations = this.chart.options.plugins.annotation.annotations as Record<string, any>;
      if (annotations['line1']) {
        annotations['line1'].borderColor = 'blue';
        annotations['line1'].yMin = newValue;
        annotations['line1'].yMax = newValue;
        this.chart.update();
      }
    }
  }

}
