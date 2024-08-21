import {Component, OnInit, ViewChild} from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { StorageService } from '../../services/storage.service';
import {BaseChartDirective} from 'ng2-charts';

@Component({
  selector: 'app-monte-carlo-page',
  standalone: true,
  imports: [
    BaseChartDirective
  ],
  templateUrl: './monte-carlo-page.component.html',
  styleUrl: './monte-carlo-page.component.scss'
})
export class MonteCarloPageComponent implements OnInit {
  results: number[] = [];
  counts: number[] = [];

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  chartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        label: 'Monte Carlo Simulation Results',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };
  chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Sum Value'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Occurrences'
        }
      }
    }
  };

  constructor(private storageService: StorageService) {}

  async ngOnInit(): Promise<void> {
    const simulationResult = await this.runSimulation(1000);
    this.results = Array.from(simulationResult.keys()).sort((a, b) => a - b);
    this.counts = this.results.map(result => simulationResult.get(result) || 0);
    this.updateChartData();
  }

  updateChartData(): void {
    // Update chart data
    this.chartData.labels = this.results.map((_, index) => index.toString());
    this.chartData.datasets[0].data = this.counts;
    this.chart?.update();
  }

  private async runSimulation(number: number): Promise<Map<number, number>> {
    // Step 1: Read the throughputs from the last 20 days
    const throughputs = await this.getThroughputsFromLast20Days();

    const results: number[] = [];
    const sumFrequency: Map<number, number> = new Map();

    for (let i = 0; i < number; i++) {
      // Step 2: Select 14 random values and sum them
      const sum = this.getRandomSum(throughputs, 14);
      // Step 3: Save the sum and increment the counter
      results.push(sum);
      sumFrequency.set(sum, (sumFrequency.get(sum) || 0) + 1);
    }

    // Step 4: Return the results and the counts
    return sumFrequency;
  }

  private async getThroughputsFromLast20Days(): Promise<number[]> {
    const throughputEntries = await this.storageService.getThroughputData();
    const today = new Date();
    const last20DaysThroughputs: number[] = [];

    for (let i = 0; i < 20; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const entry = throughputEntries.find(entry =>
        entry.date.getFullYear() === date.getFullYear() &&
        entry.date.getMonth() === date.getMonth() &&
        entry.date.getDate() === date.getDate()
      );
      last20DaysThroughputs.push(entry ? entry.throughput : 0);
    }

    return last20DaysThroughputs;
  }

  private getRandomSum(values: number[], count: number): number {
    const selectedValues = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * values.length);
      selectedValues.push(values[randomIndex]);
    }
    return selectedValues.reduce((sum, value) => sum + value, 0);
  }
}
