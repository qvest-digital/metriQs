import {ChangeDetectionStrategy, Component, OnInit, signal, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {JiraDataCenterService} from '../../services/jira-data-center.service';
import {StorageService} from "../../services/storage.service";
import {ToastrService} from "ngx-toastr";
import {WorkItemAgeChartComponent} from "../work-item-age-chart/work-item-age-chart.component";
import {BusinessLogicService} from "../../services/business-logic.service";
import {JiraCloudService} from "../../services/jira-cloud.service";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {MatIcon} from "@angular/material/icon";
import {MatChip, MatChipsModule} from "@angular/material/chips";
import {NgForOf} from "@angular/common";
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray} from "@angular/cdk/drag-drop";
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

export interface Status {
  name: string;
  selected: boolean;
}

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
    MatRowDef
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkItemAgePage implements OnInit {
  @ViewChild(WorkItemAgeChartComponent) workItemAgeChartComponent?: WorkItemAgeChartComponent;
  workItemAgeData: any;

  public statusDataSource = new MatTableDataSource<any>();
  public workItemAgeDataSource = new MatTableDataSource<WorkItemAgeEntry>();
  public workItemAgeColumns: string[] = ['issueId', 'issueKey', 'title', 'age', 'status'];

  public displayedColumns: string[] = ['issueKey', 'status'];

  constructor(private jiraDataCenterService: JiraDataCenterService,
              private jiraCloudService: JiraCloudService,
              private databaseService: StorageService, private toastr: ToastrService,
              private workItemAgeService: BusinessLogicService) {
  }

  readonly availableStatuses = signal<Status[]>([
    {name: 'todo', selected: false},
    {name: 'in progress', selected: true},
    {name: 'review', selected: false},
    {name: 'done', selected: false},]);


  drop(event: CdkDragDrop<Status[]>) {
    this.availableStatuses.update(status => {
      moveItemInArray(status, event.previousIndex, event.currentIndex);
      return [...status];
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  async loadData() {
    this.workItemAgeDataSource.data = await this.databaseService.getWorkItemAgeData();
  }


}
