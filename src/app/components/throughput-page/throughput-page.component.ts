// src/app/components/throughput-page/throughput-page.component.ts
import {Component, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { StorageService } from '../../services/storage.service';
import {ThroughputEntry} from '../../models/throughputEntry';

@Component({
  selector: 'app-throughput-page',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './throughput-page.component.html',
  styleUrls: ['./throughput-page.component.scss']
})
export class ThroughputPageComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Throughput',
        backgroundColor: 'rgba(148,159,177,0.2)',
        borderColor: 'rgba(148,159,177,1)',
        pointBackgroundColor: 'rgba(148,159,177,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(148,159,177,0.8)',
        fill: 'origin',
      }
    ],
    labels: []
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
  };

  public lineChartType: ChartType = 'line';

  constructor(private storageService: StorageService) {}

  async ngOnInit() {
    const appSettings = await this.storageService.getAppSettings();
    const throughputData: ThroughputEntry[] = await this.storageService.getThroughputData(appSettings.selectedDatasourceId);
    const allDates = this.generateAllDates(throughputData);
    const mappedData = this.mapDataToDates(allDates, throughputData);

    this.lineChartData.datasets[0].data = mappedData.map(entry => entry.throughput);
    this.lineChartData.labels = mappedData.map(entry => entry.date.toDateString());
    this.chart?.update();
  }

  private generateAllDates(data: ThroughputEntry[]): { date: Date, throughput: number }[] {
    if (data.length === 0) return [];

    const startDate = new Date(Math.min(...data.map(entry => entry.date.getTime())));
    const endDate = new Date(Math.max(...data.map(entry => entry.date.getTime())));
    const allDates = [];

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      allDates.push({date: new Date(date), throughput: 0});
    }

    return allDates;
  }

  private mapDataToDates(allDates: { date: Date, throughput: number }[], data: ThroughputEntry[]): {
    date: Date,
    throughput: number
  }[] {
    const dataMap = new Map(data.map(entry => [entry.date.toDateString(), entry.throughput]));

    return allDates.map(entry => ({
      date: entry.date,
      throughput: dataMap.get(entry.date.toDateString()) || 0
    }));
  }
}
