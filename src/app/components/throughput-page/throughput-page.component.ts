// src/app/components/throughput-page/throughput-page.component.ts
import {Component, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { StorageService } from '../../services/storage.service';
import { Throughput } from '../../models/throughput';

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

  //FIXME
  async saveExampleThroughputData(): Promise<void> {
    const exampleData: Throughput[] = [
      { throughput: 5, date: new Date('2023-01-01'), issueId: 1, issueKey: 'KEY-1', title: 'Title 1' },
      { throughput: 10, date: new Date('2023-01-02'), issueId: 2, issueKey: 'KEY-2', title: 'Title 2' },
      { throughput: 15, date: new Date('2023-01-03'), issueId: 3, issueKey: 'KEY-3', title: 'Title 3' },
      { throughput: 20, date: new Date('2023-01-04'), issueId: 4, issueKey: 'KEY-4', title: 'Title 4' },
      { throughput: 25, date: new Date('2023-01-05'), issueId: 5, issueKey: 'KEY-5', title: 'Title 5' },
    ];
    await this.storageService.addThroughputData(exampleData);
  }

  async ngOnInit() {
    await this.saveExampleThroughputData();

    const throughputData: Throughput[] = await this.storageService.getThroughputData();
    this.lineChartData.datasets[0].data = throughputData.map(entry => entry.throughput);
    this.lineChartData.labels = throughputData.map(entry => entry.date.toDateString());
    this.chart?.update();
  }
}
