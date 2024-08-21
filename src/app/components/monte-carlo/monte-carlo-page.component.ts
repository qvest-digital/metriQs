import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { StorageService } from '../../services/storage.service';
import {BaseChartDirective} from "ng2-charts";

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

      },
      y: {
        beginAtZero: true
      }
    }
  };

  constructor(private storageService: StorageService) {}

  async ngOnInit(): Promise<void> {
    const simulationResult = await this.runSimulation(1000);
    this.results = simulationResult.results;
    console.log(`Counts for each sum: ${simulationResult.counts}`);
    this.updateChartData();
  }

  updateChartData(): void {
    this.chartData.labels = this.results.map((_, index) => index.toString());
    this.chartData.datasets[0].data = this.results;
  }

  private async runSimulation(number: number): Promise<{ results: number[], counts: number[] }> {
    // Step 1: Read the throughputs from the last 20 days
    const throughputs = await this.getThroughputsFromLast20Days();

    const results: number[] = [];
    const counts: number[] = new Array(number).fill(0);
    for (let i = 0; i < number; i++) {
      // Step 2: Select 14 random values and sum them
      const sum = this.getRandomSum(throughputs, 14);
      // Step 3: Save the sum and increment the counter
      results.push(sum);
      counts[sum] = (counts[sum] || 0) + 1;
    }
    // Step 4: Return the results and the counts
    return { results, counts };
  }

  private async getThroughputsFromLast20Days(): Promise<number[]> {
    const throughputEntries = await this.storageService.getThroughputData();
    const last20DaysThroughputs = throughputEntries
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 20)
      .map(entry => entry.throughput);
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
