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
    const throughputData: ThroughputEntry[] = await this.storageService.getThroughputData();
    this.lineChartData.datasets[0].data = throughputData.map(entry => entry.throughput);
    this.lineChartData.labels = throughputData.map(entry => entry.date.toDateString());
    this.chart?.update();
  }
}
