import {Injectable} from '@angular/core';
import {Issue} from "../models/issue";
import {WorkItemAgeEntry} from "../models/workItemAgeEntry";
import {StorageService} from "./storage.service";
import {Version3} from "jira.js";
import {IssueHistory} from "../models/IssueHistory";
import {CycletimeEntry} from "../models/cycletimeEntry";

@Injectable({
  providedIn: 'root'
})
export class WorkItemAgeService {

  constructor() {
  }

  public mapChangelogToIssueHistory(issueId: number, changelog: any): IssueHistory[] {
    const issueHistories: IssueHistory[] = [];

    changelog.histories.forEach((history: any) => {
      history.items!.forEach((item: { fromString: any; toString: any; field: any; }) => {
        const issueHistory: IssueHistory = {
          issueId: issueId,
          fromValue: item.fromString || '',
          toValue: item.toString || '',
          field: item.field || '',
          createdDate: new Date(history.created!)
        };
        console.log('issueHistory', history);
        issueHistories.push(issueHistory);
      });
    });
    return issueHistories;
  }


  map2WorkItemAgeEntries(issues: Issue[]): WorkItemAgeEntry[] {
    const workItemAgeEntries: WorkItemAgeEntry[] = [];
    for (const issue of issues) {
      const workItemAgeEntry: WorkItemAgeEntry = {
        issueId: issue.id!,
        issueKey: issue.issueKey,
        status: issue.status,
        title: issue.title,
        age: this.calculateAge(issue.createdDate, new Date()),
      };
      workItemAgeEntries.push(workItemAgeEntry);
    }
    return workItemAgeEntries;

  }

  calculateAge(createdDate: Date, currentDate: Date): number {
    const diffInMs = currentDate.getTime() - createdDate.getTime();
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  }


  map2CycleTimeEntries(issueHistories: IssueHistory[], issue: Issue): CycletimeEntry[] {
    const cycleTimeEntries: CycletimeEntry[] = [];

    if (issue && issueHistories.length > 0) {
      const latestClosedDate = this.findLatestResolvedIssueHistory(issueHistories);
      const firstInProgressDate = this.findFirstInProgressIssueHistory(issueHistories);

      if (latestClosedDate != undefined && firstInProgressDate != undefined) {
        const cycleTimeEntry: CycletimeEntry = {
          inProgressState: firstInProgressDate.toValue,
          resolvedState: latestClosedDate.toValue,
          resolvedDate: latestClosedDate!.createdDate,
          inProgressDate: firstInProgressDate!.createdDate,
          issueId: issue.id!,
          issueKey: issue.issueKey,
          title: issue.title,
          cycleTime: this.calculateAge(firstInProgressDate!.createdDate, latestClosedDate!.createdDate)
        };

        cycleTimeEntries.push(cycleTimeEntry);
      }
    }
    return cycleTimeEntries;
  }

  private findLatestResolvedIssueHistory(issueHistories: IssueHistory[]): IssueHistory | undefined {
    return issueHistories
      .filter(history => history.field === 'status' && history.toValue === 'Done')
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())[0];
  }

  private findFirstInProgressIssueHistory(issueHistories: IssueHistory[]): IssueHistory | undefined {
    return issueHistories
      .filter(history => history.field === 'status' && history.toValue === 'In Progress')
      .sort((a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime())[0];
  }

}
