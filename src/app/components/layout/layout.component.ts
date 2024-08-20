// src/app/components/layout/layout.component.ts
import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {AsyncPipe, NgForOf} from '@angular/common';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {RouterLink, RouterOutlet} from "@angular/router";
import {MatSelectModule} from "@angular/material/select";
import {MatFormFieldModule} from "@angular/material/form-field";
import {StorageService} from "../../services/storage.service";
import {Dataset, DataSetType} from "../../models/dataset";
import {ToastrService} from "ngx-toastr";
import {CYCLE_TIME, DASHBOARD, MANAGE_DATASETS, THROUGHPUT, WORK_ITEM_AGE} from "../../app-routing.module";
import {JiraDataCenterService} from "../../services/jira-data-center.service";
import {JiraCloudService} from "../../services/jira-cloud.service";
import {WorkItemAgeChartComponent} from "../work-item-age-chart/work-item-age-chart.component";

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    AsyncPipe,
    RouterOutlet,
    RouterLink,
    NgForOf,
    WorkItemAgeChartComponent
  ]
})
export class LayoutComponent implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  protected readonly DASHBOARD = DASHBOARD;
  protected readonly CYCLE_TIME = CYCLE_TIME;
  protected readonly WORK_ITEM_AGE = WORK_ITEM_AGE;

  @ViewChild(WorkItemAgeChartComponent) workItemAgeChartComponent!: WorkItemAgeChartComponent;

  constructor(
    private storageService: StorageService,
    private toastr: ToastrService,
    private jiraDataCenterService: JiraDataCenterService,
    private jiraCloudService: JiraCloudService,
  ) {
  }

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  datasets: Dataset[] = [];
  selectedDataset: number | undefined;

  onDatasetChange(event: any) {
    this.storageService.getDataset(event.value).then((dataset: Dataset) => {
      this.toastr.success('Selected dataset: ' + dataset.name);
      this.selectedDataset = dataset.id!;
      this.storageService.saveAppSettings({selectedDatasetId: dataset.id!});
    });
  }

  ngOnInit(): void {
    this.refreshDatasets();
  }

  refreshDatasets(): void {
    this.storageService.getAllDatasets().then((datasets: Dataset[]) => {
      this.datasets = datasets;
      if (this.datasets.length > 0) {
        this.selectedDataset = this.datasets[0].id!;
      }
    });
  }

  async login() {
    if (this.selectedDataset) {
      const selectedDataset = this.datasets.find(dataset => dataset.id === this.selectedDataset);
      await this.storageService.saveAppSettings({selectedDatasetId: this.selectedDataset});
      if (selectedDataset) {
        if (selectedDataset.type === 'JIRA_CLOUD') {
          this.loginToJiraCloud();
        } else {
          this.loginToJiraDataCenter();
        }
      }
    }
  }

  async loginToJiraCloud() {
    try {
      this.jiraCloudService.login(this.selectedDataset!);
    } catch (error) {
      this.toastr.error(error!.toString(), 'Failed to log in to Jira');
    }
  }

  loginToJiraDataCenter() {
    try {
      this.jiraDataCenterService.login(this.selectedDataset!);
      this.toastr.success('Successfully logged in to Jira');
    } catch (error) {
      this.toastr.error(error!.toString(), 'Failed to log in to Jira');
    }
  }

  async refreshIssues(silent = false) {
    if (this.selectedDataset) {
      const selectedDataset = this.datasets.find(dataset => dataset.id === this.selectedDataset);
      if (selectedDataset) {
        if (selectedDataset.type === DataSetType.JIRA_CLOUD) {

          await this.jiraCloudService.getAndSaveIssues(this.selectedDataset!);
          try {
            if (!silent)
              this.toastr.success('Successfully fetched issues from Jira');
          } catch (error) {
            if (!silent)
              this.toastr.error(error!.toString(), 'Failed to fetch issues from Jira');
          }
        } else {
          this.loginToJiraDataCenter();
        }
      }
    }
  }

  async clearDatabase() {
    const success = await this.storageService.recreateDatabase();
    if (success) {
      this.toastr.success('Successfully cleared all data');
    } else {
      this.toastr.error('Failed to clear all data');
    }
  }

    protected readonly THROUGHPUT = THROUGHPUT;
  protected readonly MANAGE_DATASETS = MANAGE_DATASETS;
}
