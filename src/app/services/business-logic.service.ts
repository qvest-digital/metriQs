import {Injectable} from '@angular/core';
import {Issue} from "../models/issue";
import {WorkItemAgeEntry} from "../models/workItemAgeEntry";
import {StorageService} from "./storage.service";
import {Version3} from "jira.js";
import {IssueHistory} from "../models/issueHistory";
import {CycletimeEntry} from "../models/cycletimeEntry";
import {Status} from "../models/status";

@Injectable({
  providedIn: 'root'
})
export class BusinessLogicService {

  constructor() {
  }

  public mapChangelogToIssueHistory(issue: Issue, changelog: any): IssueHistory[] {
    const issueHistories: IssueHistory[] = [];

    changelog.histories.forEach((history: any) => {
      history.items!.forEach((item: { fromString: any; toString: any; field: any; }) => {
        const issueHistory: IssueHistory = {
          issueId: issue.id!,
          datasetId: issue.dataSetId,
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

  public findAllStatuses(issues: Issue[], issueHistories: IssueHistory[]): Status[] {
    const statuses = new Set<Status>();

    issues.forEach(issue => {
      const status: Status = {
        dataSetId: issue.dataSetId,
        name: issue.status
      };
      statuses.add(status);
    });

    issueHistories.forEach(history => {
      if (history.field === 'status') {
        if (!this.stateExistsInSet(statuses, history.fromValue)) {

          statuses.add({dataSetId: history.datasetId, name: history.fromValue});
        } else if (!this.stateExistsInSet(statuses, history.toValue)) {
          statuses.add({dataSetId: history.datasetId, name: history.toValue});
        }
      }
    });

    return Array.from(statuses);
  }

  private stateExistsInSet(set: Set<Status>, name: string): boolean {
    for (let item of set) {
      if (item.name === name) {
        return true; // Object with the same key already exists
      }
    }
    return false;
  }

}
