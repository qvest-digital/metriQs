// src/app/components/status-history-table/status-history-table.component.ts
import {Component, OnInit} from '@angular/core';
import {
  MatCell, MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {DatePipe, registerLocaleData} from "@angular/common";
import localeDe from '@angular/common/locales/de';
import {IssueHistory} from "../../models/issueHistory";
import {Issue} from "../../models/issue";
import {StorageService} from "../../services/storage.service";
import {BusinessLogicService} from "../../services/business-logic.service";

registerLocaleData(localeDe);

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
}

@Component({
  selector: 'status-history-table',
  templateUrl: './status-history-table.component.html',
  standalone: true,
  imports: [
    MatFormField,
    MatInput,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef,
    DatePipe
  ],
  styleUrls: ['./status-history-table.component.scss'],
  providers: [{provide: DatePipe, useClass: DatePipe, deps: []}]
})
export class SmartTableComponent implements OnInit {
  displayedColumns: string[] = ['issueKey', 'fromValue', 'toValue', 'historyCreatedDate', 'duration'];
  dataSource: MatTableDataSource<CombinedIssueHistory> = new MatTableDataSource<CombinedIssueHistory>();

  constructor(private storageService: StorageService, private businessLogic: BusinessLogicService) {
  }

  async ngOnInit() {
    const issueHistories = await this.storageService.getAllIssueHistoriesForStatuses();
    const issuesIds = this.businessLogic.removeDuplicates(issueHistories.map(issueHistory => issueHistory.issueId));
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
  }

  calculateDuration(historyDate: Date, issueDate: Date): string {
    const duration = Math.abs(historyDate.getTime() - issueDate.getTime());
    const days = Math.ceil(duration / (1000 * 3600 * 24));
    return `${days} days`;
  }
}
