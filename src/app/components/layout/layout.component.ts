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
import {Datasource, DataSourceType} from "../../models/datasource";
import {ToastrService} from "ngx-toastr";
import {
  CYCLE_TIME,
  DASHBOARD,
  DATASOURCE_LIST,
  THROUGHPUT,
  WORK_IN_PROGRESS,
  WORK_ITEM_AGE
} from "../../app-routing.module";
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
  protected readonly THROUGHPUT = THROUGHPUT;
  protected readonly DATASOURCE_LIST = DATASOURCE_LIST;

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

  datasources: Datasource[] = [];
  selectedDatasource: number | undefined;

  onDatasourceChange(event: any) {
    this.storageService.getDatasource(event.value).then((dataset: Datasource) => {
      this.toastr.success('Selected datasource: ' + dataset.name);
      this.selectedDatasource = dataset.id!;
      this.storageService.saveAppSettings({selectedDatasourceId: dataset.id!});
    });
  }

  ngOnInit(): void {
    this.refreshDatasources();
  }

  refreshDatasources(): void {
    this.storageService.getAllDatasources().then((datasource: Datasource[]) => {
      this.datasources = datasource;
      if (this.datasources.length > 0) {
        this.selectedDatasource = this.datasources[0].id!;
      }
    });
  }

  async login() {
    if (this.selectedDatasource) {
      const selectedDataset = this.datasources.find(dataset => dataset.id === this.selectedDatasource);
      await this.storageService.saveAppSettings({selectedDatasourceId: this.selectedDatasource});
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
      this.jiraCloudService.login(this.selectedDatasource!);
    } catch (error) {
      this.toastr.error(error!.toString(), 'Failed to log in to Jira');
    }
  }

  loginToJiraDataCenter() {
    try {
      this.jiraDataCenterService.login(this.selectedDatasource!);
      this.toastr.success('Successfully logged in to Jira');
    } catch (error) {
      this.toastr.error(error!.toString(), 'Failed to log in to Jira');
    }
  }

  async refreshIssues(silent = false) {
    if (this.selectedDatasource) {
      const selectedDataset = this.datasources.find(dataset => dataset.id === this.selectedDatasource);
      if (selectedDataset) {
        if (selectedDataset.type === DataSourceType.JIRA_CLOUD) {

          await this.jiraCloudService.getAndSaveIssues(this.selectedDatasource!);
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

  protected readonly WORK_IN_PROGRESS = WORK_IN_PROGRESS;
}
