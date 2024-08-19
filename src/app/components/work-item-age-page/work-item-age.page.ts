import {ChangeDetectionStrategy, Component, OnInit, signal, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {StorageService} from "../../services/storage.service";
import {ToastrService} from "ngx-toastr";
import {WorkItemAgeChartComponent} from "../work-item-age-chart/work-item-age-chart.component";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {MatIcon} from "@angular/material/icon";
import {MatChip, MatChipsModule} from "@angular/material/chips";
import {NgForOf} from "@angular/common";
import {CdkDrag, CdkDropList} from "@angular/cdk/drag-drop";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from "@angular/material/table";
import {WorkItemAgeEntry} from "../../models/workItemAgeEntry";
import {Status, StatusCategory} from "../../models/status";
import {StatusHistoryTableComponent} from "../status-history-table/status-history-table.component";

@Component({
  selector: 'app-work-item-age-page',
  templateUrl: './work-item-age.page.html',
  styleUrl: './work-item-age.page.scss',
  imports: [
    FormsModule,
    WorkItemAgeChartComponent,
    MatCardContent,
    MatCardTitle,
    MatCardHeader,
    MatGridTile,
    MatGridList,
    MatCard,
    MatIcon,
    MatChipsModule, // Add MatChipsModule here
    MatChip,
    NgForOf,
    CdkDropList,
    CdkDrag,
    MatTable,
    MatHeaderCell,
    MatCell,
    MatColumnDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatCellDef,
    MatHeaderCellDef,
    MatRow,
    MatRowDef,
    StatusHistoryTableComponent
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkItemAgePage implements OnInit {
  @ViewChild(WorkItemAgeChartComponent) workItemAgeChartComponent?: WorkItemAgeChartComponent;
  workItemAgeData: any;

  public statusDataSource = new MatTableDataSource<any>();
  public workItemAgeDataSource = new MatTableDataSource<WorkItemAgeEntry>();
  public workItemAgeColumns: string[] = ['issueId', 'issueKey', 'title', 'inProgressStatusDate', 'age', 'status'];

  public displayedColumns: string[] = ['issueKey', 'status'];

  constructor(private databaseService: StorageService, private toastr: ToastrService) {
  }

  availableStatuses = signal<Status[]>([]);


  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    let data = await this.databaseService.getWorkItemAgeData();

    const statusInProgress = await this.databaseService.getAllStatuses().then(statuses => {
      return statuses.filter(status => status.category === StatusCategory.InProgress);
    })

    // Filter the work items that are in progress
    const inProgressStatusIds = statusInProgress.map(status => status.externalId);
    data = data.filter(wIEntry =>
      inProgressStatusIds.includes(wIEntry.externalStatusId)
    );

    this.availableStatuses.set(statusInProgress);

    // Set the workItemAgeData in the chart component
    if (this.workItemAgeChartComponent) {
      //FIXME: löst kein ngChange aus
      this.workItemAgeChartComponent.workItemAgeData = data;
      this.workItemAgeChartComponent.updateChartData();
    }
    this.workItemAgeDataSource.data = data;
  }


}
