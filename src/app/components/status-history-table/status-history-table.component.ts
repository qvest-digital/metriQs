import {Component, LOCALE_ID, OnInit, ViewChild} from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {IssueHistory} from "../../models/issueHistory";
import {StorageService} from "../../services/storage.service";
import {BusinessLogicService} from "../../services/business-logic.service";
import {MatInput} from "@angular/material/input";
import {DatePipe, registerLocaleData} from "@angular/common";
import localeDe from '@angular/common/locales/de';

interface CombinedIssueHistory {
  issueId: number;
  issueKey: string;
  title: string;
  createdDate: Date;
  status: string;
  fromValue: string;
  toValue: string;
  field: string;
  historyCreatedDate: Date;
  duration: string;

  [key: string]: any;
}

@Component({
  selector: 'status-history-table',
  templateUrl: './status-history-table.component.html',
  standalone: true,
  imports: [
    MatInput,
    MatHeaderCell,
    MatTable,
    MatColumnDef,
    MatCell,
    MatCellDef,
    MatHeaderCellDef,
    DatePipe,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef
  ],
  styleUrls: ['./status-history-table.component.scss'],
  providers: [{provide: LOCALE_ID, useValue: 'de'}]
})
export class StatusHistoryTableComponent implements OnInit {
  displayedColumns: string[] = ['issueKey', 'fromValue', 'toValue', 'historyCreatedDate', 'duration'];
  dataSource: MatTableDataSource<CombinedIssueHistory> = new MatTableDataSource<CombinedIssueHistory>();

  @ViewChild(MatSort) sort: MatSort | undefined;

  constructor(private storageService: StorageService, private businessLogic: BusinessLogicService) {
    registerLocaleData(localeDe);
  }

  async ngOnInit() {
    const issueHistories = await this.storageService.getAllIssueHistoriesForStatuses();
    const issuesIds = this.businessLogic.removeDuplicates(issueHistories.map(issueHistory => issueHistory.issueId), (a, b) => a == b);
    const issues = await this.storageService.getIssuesByIds(issuesIds);

    const combinedData: CombinedIssueHistory[] = issueHistories.map(issueHistory => {
      const issue = issues.find(issue => issue.id === issueHistory.issueId);
      return {
        issueId: issueHistory.issueId,
        issueKey: issue!.issueKey || '',
        title: issue!.title || '',
        createdDate: issue!.createdDate,
        status: issue!.status || '',
        fromValue: issueHistory.fromValue,
        toValue: issueHistory.toValue,
        field: issueHistory.field,
        historyCreatedDate: issueHistory.createdDate,
        duration: this.calculateDuration(issueHistory.createdDate, issue?.createdDate!)
      };
    }).sort((a, b) => {
      if (a.issueId !== b.issueId) {
        return a.issueId - b.issueId;
      }
      return a.historyCreatedDate.getTime() - b.historyCreatedDate.getTime();
    });

    this.dataSource.data = combinedData;
    this.dataSource.sort = this.sort!;
  }

  calculateDuration(historyDate: Date, issueDate: Date): string {
    const duration = Math.abs(historyDate.getTime() - issueDate.getTime());
    const days = Math.ceil(duration / (1000 * 3600 * 24));
    return `${days} days`;
  }

  applyFilter(event: Event, column: string) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filterPredicate = (data: CombinedIssueHistory, filter: string) => {
      const textToSearch = data[column] && data[column].toString().toLowerCase() || '';
      return textToSearch.indexOf(filter.toLowerCase()) !== -1;
    };
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
