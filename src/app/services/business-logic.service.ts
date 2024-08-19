import {Injectable} from '@angular/core';
import {Issue} from "../models/issue";
import {WorkItemAgeEntry} from "../models/workItemAgeEntry";
import {StorageService} from "./storage.service";
import {IssueHistory} from "../models/issueHistory";
import {CycletimeEntry} from "../models/cycletimeEntry";
import {Status, StatusCategory} from "../models/status";

@Injectable({
  providedIn: 'root'
})
export class BusinessLogicService {

  constructor(private storageService: StorageService) {
  }

  findFirstStatusChange(changelog: any): any | undefined {
    const statusHistories = changelog.histories
      .filter((history: any) => history.items.some((item: any) => item.field === 'status'))
      .sort((a: any, b: any) => new Date(a.created).getTime() - new Date(b.created).getTime());

    return statusHistories.length > 0 ? statusHistories[0] : undefined;
  }

  public mapChangelogToIssueHistory(issue: Issue, changelog: any): IssueHistory[] {
    const issueHistories: IssueHistory[] = [];

    const firstStatusChange = this.findFirstStatusChange(changelog);
    if (firstStatusChange) {
      const findStatusHistory = changelog.histories.find((history: any) => history.items.some((item: any) => item.field === 'status'));
      // Add a separate IssueHistory entry for the issue with createdDate
      const issueCreatedHistory: IssueHistory = {
        issueId: issue.id!,
        datasetId: issue.dataSetId,
        fromValue: '',
        toValueId: Number.parseInt(findStatusHistory.items[0].from),
        toValue: firstStatusChange.items[0].fromString,
        field: 'status',
        createdDate: new Date(issue.createdDate!)
      };
      issueHistories.push(issueCreatedHistory);
    }

    changelog.histories.forEach((history: any) => {
      history.items!.forEach((item: {
        fromString: string;
        toString: string;
        field: string;
        from: string,
        to: string
      }) => {
        const issueHistory: IssueHistory = {
          issueId: issue.id!,
          datasetId: issue.dataSetId,
          fromValue: item.fromString || '',
          fromValueId: Number.parseInt(item.from),
          toValueId: Number.parseInt(item.to),
          toValue: item.toString || '',
          field: item.field || '',
          createdDate: new Date(history.created!)
        };
        issueHistories.push(issueHistory);
      });
    });
    return issueHistories;
  }


  async map2WorkItemAgeEntries(issues: Issue[]) {
    const workItemAgeEntries: WorkItemAgeEntry[] = [];
    for (const issue of issues) {

      const historyEntry = await this.findFirstInProgressStatusChange(issue);
      if (!historyEntry) {
        continue;
      }
      const workItemAgeEntry: WorkItemAgeEntry = {
        issueId: issue.id!,
        issueKey: issue.issueKey,
        status: issue.status,
        externalStatusId: issue.externalStatusId,
        title: issue.title,
        inProgressStatusDate: historyEntry.createdDate,
        age: this.calculateAge(historyEntry.createdDate, new Date()),
      };
      workItemAgeEntries.push(workItemAgeEntry);
    }
    return workItemAgeEntries;

  }

  async getAllInProgressStatuses(): Promise<Status[]> {
    const allStatuses = await this.storageService.getAllStatuses();
    return allStatuses.filter(status => status.category === StatusCategory.InProgress);
  }

  public async findFirstInProgressStatusChange(issue: Issue) {
    const allStatuses = await this.storageService.getAllStatuses();
    const inProgressStatusIds = allStatuses
      .filter(status => status.category === StatusCategory.InProgress)
      .map(status => status.externalId);

    const issueHistories = await this.storageService.getAllIssueHistoriesForIssue(issue);

    return issueHistories
      .filter(history => history.field === 'status' && inProgressStatusIds.includes(history.toValueId!))
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())[0];
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

  public findAllNewStatuses(issues: Issue[], issueHistories: IssueHistory[]): Status[] {
    let statuses = new Array<Status>();

    issues.forEach(issue => {
      const status: Status = {
        dataSetId: issue.dataSetId,
        name: issue.status,
        externalId: issue.externalStatusId
      };
      statuses.push(status);
    });
    statuses = this.removeDuplicates(statuses, (a, b) => a.externalId === b.externalId);

    issueHistories.forEach(history => {
      if (history.field === 'status') {
        if (history.fromValueId && !this.stateExistsInSet(statuses, history.fromValueId!)) {

          statuses.push({dataSetId: history.datasetId, name: history.fromValue, externalId: history.fromValueId!});
        } else if (history.toValueId && !this.stateExistsInSet(statuses, history.toValueId!)) {
          statuses.push({dataSetId: history.datasetId, name: history.toValue, externalId: history.toValueId!});
        }
      }
    });

    return Array.from(statuses);
  }

  private stateExistsInSet(set: Array<Status>, externalId: number): boolean {
    for (let item of set) {
      if (item.externalId === externalId) {
        return true; // Object with the same key already exists
      }
    }
    return false;
  }


  filterOutMappedStatuses(newStatesFound: Status[], allStatuses: Status[]) {
    return newStatesFound.filter(newState =>
      !allStatuses.some(existingState => existingState.category === newState.category || existingState.externalId === newState.externalId)
    );
  }

  removeDuplicates<T>(array: T[], compareFn: (a: T, b: T) => boolean): T[] {
    const uniqueArray: T[] = [];
    array.forEach(item => {
      if (!uniqueArray.some(uniqueItem => compareFn(item, uniqueItem))) {
        uniqueArray.push(item);
      }
    });
    return uniqueArray;
  }

  computePercentile(cycleTimes: number[], percentile: number): number {
    // Sort the cycle times array
    const sortedCycleTimes = [...cycleTimes].sort((a, b) => a - b);

    // Calculate the index for the given percentile
    const index = Math.ceil((percentile / 100) * sortedCycleTimes.length) - 1;

    // Return the cycle time at the calculated index
    return sortedCycleTimes[index];
  }
}
