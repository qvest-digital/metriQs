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
    issueHistories.forEach(history => {
      if (issue) {
        const cycleTimeEntry: CycletimeEntry = {
          issueId: history.issueId,
          issueKey: issue.issueKey,
          title: issue.title,
          //FIXME: calculate cycle time is not correct
          cycleTime: this.calculateAge(history.createdDate, new Date()),
          status: issue.status
        };
        cycleTimeEntries.push(cycleTimeEntry);
      }
    });
    return cycleTimeEntries;
  }

}
