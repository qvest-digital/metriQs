import {Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BaseChartDirective} from 'ng2-charts';
import {ChartConfiguration, ChartType} from 'chart.js';
import {StorageService} from '../../services/storage.service';
import {ThroughputEntry} from '../../models/throughputEntry';
import {WorkInProgressEntry} from "../../models/workInProgressEntry";

@Component({
  selector: 'app-work-in-progress-page',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './work-in-progress-page.component.html',
  styleUrls: ['./work-in-progress-page.component.scss']
})
export class WorkInProgressPageComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Work In Progress',
        backgroundColor: 'rgba(77,83,96,0.2)',
        borderColor: 'rgba(77,83,96,1)',
        pointBackgroundColor: 'rgba(77,83,96,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(77,83,96,0.8)',
        fill: 'origin',
      }
    ],
    labels: []
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
  };

  public lineChartType: ChartType = 'line';

  constructor(private storageService: StorageService) {
  }

  async ngOnInit() {
    const appSettings = await this.storageService.getAppSettings();
    const wipData: WorkInProgressEntry[] = await this.storageService.getWorkInProgressData(appSettings.selectedDatasourceId);
    const allDates = this.generateAllDates(wipData);
    const mappedData = this.mapDataToDates(allDates, wipData);

    this.lineChartData.datasets[0].data = mappedData.map(entry => entry.wip);
    this.lineChartData.labels = mappedData.map(entry => entry.date.toDateString());
    this.chart?.update();
  }

  private generateAllDates(data: WorkInProgressEntry[]): { date: Date, wip: number }[] {
    if (data.length === 0) return [];

    const startDate = new Date(Math.min(...data.map(entry => entry.date.getTime())));
    const endDate = new Date(Math.max(...data.map(entry => entry.date.getTime())));
    const allDates = [];

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      allDates.push({date: new Date(date), wip: 0});
    }

    return allDates;
  }

  private mapDataToDates(allDates: { date: Date, wip: number }[], data: WorkInProgressEntry[]): {
    date: Date,
    wip: number
  }[] {
    const dataMap = new Map(data.map(entry => [entry.date.toDateString(), entry.wip]));

    return allDates.map(entry => ({
      date: entry.date,
      wip: dataMap.get(entry.date.toDateString()) || 0
    }));
  }
}
