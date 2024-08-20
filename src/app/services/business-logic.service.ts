import {Injectable} from '@angular/core';
import {Issue} from "../models/issue";
import {WorkItemAgeEntry} from "../models/workItemAgeEntry";
import {StorageService} from "./storage.service";
import {IssueHistory} from "../models/issueHistory";
import {CycleTimeEntry} from "../models/cycleTimeEntry";
import {Status, StatusCategory} from "../models/status";
import {CanceledCycleEntry} from "../models/canceledCycleEntry";
import {ThroughputEntry} from "../models/throughputEntry";
import {count} from "rxjs";
import {WorkInProgressEntry} from "../models/workInProgressEntry";

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
        datasourceId: issue.dataSourceId,
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
          datasourceId: issue.dataSourceId,
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


  public async findLatestResolvedIssueHistory(issueHistories: IssueHistory[]): Promise<IssueHistory | undefined> {
    const allStatuses = await this.storageService.getAllStatuses();
    const doneStatusIds = allStatuses
      .filter(status => status.category === StatusCategory.Done)
      .map(status => status.externalId);

    const resolvedHistories = issueHistories
      .filter(history => history.field === 'status' && doneStatusIds.includes(history.toValueId!))
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());

    return resolvedHistories.length > 0 ? resolvedHistories[0] : undefined;
  }

  public async findFirstInProgressIssueHistory(issueHistories: IssueHistory[]): Promise<IssueHistory | undefined> {
    const allStatuses = await this.storageService.getAllStatuses();
    const doneStatusIds = allStatuses
      .filter(status => status.category === StatusCategory.InProgress)
      .map(status => status.externalId);

    const resolvedHistories = issueHistories
      .filter(history => history.field === 'status' && doneStatusIds.includes(history.toValueId!))
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());

    return resolvedHistories.length > 0 ? resolvedHistories[0] : undefined;
  }

  public findAllNewStatuses(issues: Issue[], issueHistories: IssueHistory[]): Status[] {
    let statuses = new Array<Status>();

    issues.forEach(issue => {
      const status: Status = {
        dataSourceId: issue.dataSourceId,
        name: issue.status,
        externalId: issue.externalStatusId
      };
      statuses.push(status);
    });
    statuses = this.removeDuplicates(statuses, (a, b) => a.externalId === b.externalId);

    issueHistories.forEach(history => {
      if (history.field === 'status') {
        if (history.fromValueId && !this.stateExistsInSet(statuses, history.fromValueId!)) {

          statuses.push({
            dataSourceId: history.datasourceId,
            name: history.fromValue,
            externalId: history.fromValueId!
          });
        } else if (history.toValueId && !this.stateExistsInSet(statuses, history.toValueId!)) {
          statuses.push({dataSourceId: history.datasourceId, name: history.toValue, externalId: history.toValueId!});
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

  async analyzeIssueHistoriesForStatusChanges(issueHistories: IssueHistory[], i: Issue): Promise<{
    wiaEntry: WorkItemAgeEntry,
    canEntries: CanceledCycleEntry[],
    cycleTEntries: CycleTimeEntry[]
  }> {
    const cycleTimeEntries: CycleTimeEntry[] = [];
    const canceledCycleEntries: CanceledCycleEntry[] = [];
    let workItemAgeEntry: WorkItemAgeEntry | null = null;

    const allStatuses = await this.storageService.getAllStatuses();
    const inProgressStatusIds = allStatuses.filter(status => status.category === StatusCategory.InProgress).map(status => status.externalId);
    const doneStatusIds = allStatuses.filter(status => status.category === StatusCategory.Done).map(status => status.externalId);
    const toDoProgressStatusIds = allStatuses.filter(status => status.category === StatusCategory.ToDo).map(status => status.externalId);

    let startCycleEntry: IssueHistory | null = null;
    let endCycleEntry: IssueHistory | null = null;
    let canceledCycleEntry: IssueHistory | null = null;

    for (const history of issueHistories.sort((a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime())) {
      if (history.field === 'status') {
        if (inProgressStatusIds.includes(history.toValueId!)) {
          if (toDoProgressStatusIds.includes(history.fromValueId!) || doneStatusIds.includes(history.fromValueId!)) {
            // Start a new cycle if the issue switches into an InProgress state from a state that is not InProgress
            startCycleEntry = history;
          }
        } else if (doneStatusIds.includes(history.toValueId!)) {
          if (inProgressStatusIds.includes(history.fromValueId!)) {
            endCycleEntry = history;
          }
        } else if (toDoProgressStatusIds.includes(history.toValueId!) && inProgressStatusIds.includes(history.fromValueId!)) {
          canceledCycleEntry = history;
        }
        if (startCycleEntry && endCycleEntry) {
          // End the cycle if the issue switches into a Done state
          const cycleTimeEntry: CycleTimeEntry = {
            status: endCycleEntry.toValue,
            externalStatusId: endCycleEntry.toValueId!,
            inProgressState: startCycleEntry.toValue,
            inProgressDate: startCycleEntry.createdDate,
            externalInProgressStatusId: startCycleEntry.toValueId!,
            resolvedState: endCycleEntry.toValue,
            resolvedDate: endCycleEntry.createdDate,
            externalResolvedStatusId: endCycleEntry.toValueId!,
            issueId: i.id!,
            issueKey: i.issueKey,
            title: i.title,
            cycleTime: this.calculateAge(startCycleEntry.createdDate, endCycleEntry.createdDate)
          };
          cycleTimeEntries.push(cycleTimeEntry);
          startCycleEntry = null;
          endCycleEntry = null;
        } else if (startCycleEntry && canceledCycleEntry) {
          //create a canceled cycle entry
          const canceledCycle: CanceledCycleEntry = {
            status: canceledCycleEntry.toValue,
            externalStatusId: canceledCycleEntry.toValueId!,
            inProgressState: startCycleEntry.toValue,
            inProgressDate: startCycleEntry.createdDate,
            externalInProgressStatusId: startCycleEntry.toValueId!,
            resolvedState: canceledCycleEntry.toValue,
            resolvedDate: canceledCycleEntry.createdDate,
            externalResolvedStatusId: canceledCycleEntry.toValueId!,
            issueId: i.id!,
            issueKey: i.issueKey,
            title: i.title,
            wastedTime: this.calculateAge(startCycleEntry.createdDate, canceledCycleEntry.createdDate)
          };
          canceledCycleEntries.push(canceledCycle);
          startCycleEntry = null;
          canceledCycleEntry = null;
        }
      }
      if (startCycleEntry) {
        workItemAgeEntry = {
          status: i.status,
          externalStatusId: i.externalStatusId,
          inProgressState: startCycleEntry.toValue,
          inProgressDate: startCycleEntry.createdDate,
          externalInProgressStatusId: startCycleEntry.toValueId!,
          issueId: i.id!,
          issueKey: i.issueKey,
          title: i.title,
          age: this.calculateAge(startCycleEntry.createdDate, new Date())
        };
      }
    }

    return {wiaEntry: workItemAgeEntry!, canEntries: canceledCycleEntries, cycleTEntries: cycleTimeEntries};
  }

  findThroughputEntries(cycleTimeEntries: CycleTimeEntry[]): ThroughputEntry[] {
    const throughputEntries: ThroughputEntry[] = [];
    const throughputMap: Map<string, { count: number, issueIds: number[] }> = new Map();

    // Count the number of CycleTimeEntries resolved on the same day and collect issue IDs
    cycleTimeEntries.forEach(entry => {
      const resolvedDateStr = entry.resolvedDate.toISOString().split('T')[0]; // Get the date part only
      if (throughputMap.has(resolvedDateStr)) {
        const entryData = throughputMap.get(resolvedDateStr)!;
        entryData.count += 1;
        entryData.issueIds.push(entry.issueId);
      } else {
        throughputMap.set(resolvedDateStr, {count: 1, issueIds: [entry.issueId]});
      }
    });

    // Create ThroughputEntry objects using the counts from the map
    throughputMap.forEach((data, dateStr) => {
      const date = new Date(dateStr);
      const throughputEntry: ThroughputEntry = {
        date: date,
        throughput: data.count,
        issueIds: data.issueIds
      };
      throughputEntries.push(throughputEntry);
    });

    return throughputEntries;
  }


  async computeWorkInProgress(): Promise<WorkInProgressEntry[]> {
    const issueHistories: IssueHistory[] = await this.storageService.getAllIssueHistories();
    const statuses: Status[] = await this.storageService.getAllStatuses();

    const inProgressStatusIds = statuses
      .filter(status => status.category === StatusCategory.InProgress)
      .map(status => status.externalId);

    const workInProgressMap = new Map<string, Set<number>>();

    issueHistories.forEach(history => {
      const dateStr = history.createdDate.toDateString();
      if (!workInProgressMap.has(dateStr)) {
        workInProgressMap.set(dateStr, new Set<number>());
      }
      if (inProgressStatusIds.includes(history.toValueId!)) {
        workInProgressMap.get(dateStr)!.add(history.issueId);
      }
    });

    const workInProgressEntries: WorkInProgressEntry[] = [];
    workInProgressMap.forEach((issueIds, dateStr) => {
      workInProgressEntries.push({
        date: new Date(dateStr),
        wip: issueIds.size,
        issueIds: Array.from(issueIds)
      });
    });


    await this.storageService.saveWorkInProgressData(workInProgressEntries);
    return workInProgressEntries;
  }
}
