import {Injectable} from '@angular/core';
import {Issue} from "../models/issue";
import {WorkItemAgeEntry} from "../models/workItemAgeEntry";

@Injectable({
  providedIn: 'root'
})
export class WorkItemAgeService {

  constructor() { }

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

}
