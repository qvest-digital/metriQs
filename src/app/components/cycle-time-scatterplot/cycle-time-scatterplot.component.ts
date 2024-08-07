import { Component } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import {BaseChartDirective} from "ng2-charts";

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
  public scatterChartOptions: ChartConfiguration['options'] = {
    responsive: true,
  };

  public scatterChartData: ChartData<'scatter'> = {
    datasets: [
      {
        data: [
          { x: 1, y: 1 },
          { x: 2, y: 2 },
          { x: 3, y: 3 },
          { x: 4, y: 4 },
          { x: 5, y: 5 },
        ],
        label: 'Series A',
        pointRadius: 10,
      },
    ],
  };

  public scatterChartType: ChartType = 'scatter';
}
