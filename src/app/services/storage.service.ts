import {Injectable} from '@angular/core';
import {Dataset} from '../models/dataset';
import {Issue} from "../models/issue";
import {WorkItemAgeEntry} from "../models/workItemAgeEntry";
import {NgxIndexedDBModule, DBConfig, NgxIndexedDBService} from 'ngx-indexed-db';
import {firstValueFrom} from "rxjs";
import {AppSettings} from "../models/appSettings";
import {IssueHistory} from "../models/issueHistory";
import {CycletimeEntry} from "../models/cycletimeEntry";
import {Status} from "../models/status";

export class TableNames {
  static readonly DATASETS = 'datasets';
  static readonly ISSUES = 'issues';
  static readonly WORK_ITEM_AGE = 'workItemAge';
  static readonly APP_SETTINGS = 'appSettings';
  static readonly ISSUE_HISTORY = 'issueHistory';
  static readonly CYCLE_TIME = 'cycleTime';
  static readonly STATUS = 'status';
}

export const dataSetDbConfig: DBConfig = {
  name: 'metriqs-database-datasets',
  version: 1,
  migrationFactory: migrationFactoryDataset,
  objectStoresMeta: [{
    store: TableNames.DATASETS,
    storeConfig: {keyPath: 'id', autoIncrement: true},
    storeSchema: [
      {name: 'url', keypath: 'url', options: {unique: false}},
      {name: 'access_token', keypath: 'access_token', options: {unique: false}},
      {name: 'cloudId', keypath: 'cloudId', options: {unique: false}},
      {name: 'jql', keypath: 'jql', options: {unique: false}},
    ]
  }, {
    store: TableNames.APP_SETTINGS,
    storeConfig: {keyPath: 'id', autoIncrement: true}, storeSchema: []
  }, {
    store: TableNames.STATUS,
    storeConfig: {keyPath: 'id', autoIncrement: true}, storeSchema: [
      {name: 'name', keypath: 'name', options: {unique: false}},
      {name: 'category', keypath: 'category', options: {unique: false}},
      {name: 'dataSetId', keypath: 'dataSetId', options: { unique: false}},
    ]
  },
  ]};

export const dbConfigIssueData: DBConfig = {
  name: 'metriqs-database-issue-data',
  version: 1,
  migrationFactory: migrationFactory,
  objectStoresMeta: [ {
    store: TableNames.ISSUES,
    storeConfig: {keyPath: 'id', autoIncrement: true}, storeSchema: [
      {name: 'dataSetId', keypath: 'dataSetId', options: { unique: false}},
      {name: 'issueKey', keypath: 'issueKey', options: {unique: false}},
      {name: 'id', keypath: 'id', options: {unique: false}},
    ]
  }, {
      store: TableNames.WORK_ITEM_AGE,
      storeConfig: {keyPath: 'id', autoIncrement: true}, storeSchema: [
        {name: 'issueId', keypath: 'issueId', options: {unique: false}},
        {name: 'status', keypath: 'status', options: {unique: false}},
      ]
  },  {
    store: TableNames.ISSUE_HISTORY,
    storeConfig: {keyPath: 'id', autoIncrement: true}, storeSchema: [
      {name: 'issueId', keypath: 'issueId', options: {unique: false}},
      {name: 'field', keypath: 'field', options: {unique: false}},
    ]
  },
    {
      store: TableNames.CYCLE_TIME,
      storeConfig: {keyPath: 'id', autoIncrement: true}, storeSchema: [
        {name: 'issueId', keypath: 'issueId', options: {unique: false}},
      ]
    },
  ]
};

// Ahead of time compiles requires an exported function for factories
export function migrationFactory() {
  return {
    1: (db: any, transaction: { objectStore: (arg0: string) => any; }) => {
      const issues = transaction.objectStore(TableNames.ISSUES);
      const workItems = transaction.objectStore(TableNames.WORK_ITEM_AGE);
      const issueHistory = transaction.objectStore(TableNames.ISSUE_HISTORY);
      const cycleTime = transaction.objectStore(TableNames.CYCLE_TIME);
    },
  };
}

export function migrationFactoryDataset() {
  // The animal table was added with version 2 but none of the existing tables or data needed
  // to be modified so a migrator for that version is not included.
  return {
    1: (db: any, transaction: { objectStore: (arg0: string) => any; }) => {
      const issues = transaction.objectStore(TableNames.DATASETS);
      const settings = transaction.objectStore(TableNames.APP_SETTINGS);
      const status = transaction.objectStore(TableNames.STATUS);
    },
  };
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private dbService: NgxIndexedDBService) {
  }

  async addDataset(dataset: Dataset): Promise<Dataset> {
    this.dbService.selectDb(dataSetDbConfig.name);
    return firstValueFrom(this.dbService.add(TableNames.DATASETS, dataset));
  }

  async getAllDatasets(): Promise<Dataset[]> {
    this.dbService.selectDb(dataSetDbConfig.name);
    return firstValueFrom(this.dbService.getAll<Dataset>(TableNames.DATASETS));
  }

  async removeDataset(id: number): Promise<void> {
    this.dbService.selectDb(dataSetDbConfig.name);
    await firstValueFrom(this.dbService.delete(TableNames.DATASETS, id));
  }

  async updateDataset(dataset: Dataset): Promise<Dataset> {
    this.dbService.selectDb(dataSetDbConfig.name);
    return await firstValueFrom(this.dbService.update(TableNames.DATASETS, dataset));
  }

  async hasWorkItemAgeData(): Promise<boolean> {
    this.dbService.selectDb(dbConfigIssueData.name);
    return await firstValueFrom(this.dbService.count(TableNames.WORK_ITEM_AGE)) > 0;
  }

  async getAllIssues(): Promise<Issue[]> {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.getAll(TableNames.ISSUES));
  }

  async getWorkItemAgeData(): Promise<WorkItemAgeEntry[]> {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.getAll(TableNames.WORK_ITEM_AGE));
  }

  async addissue(issue: Issue): Promise<Issue> {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.add(TableNames.ISSUES, issue));
  }

  async addIssues(issues: Issue[]): Promise<number[]> {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.bulkAdd(TableNames.ISSUES, issues));
  }

  async addWorkItemAgeData(workItemAgeEntries: WorkItemAgeEntry[]): Promise<number[]> {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.bulkAdd(TableNames.WORK_ITEM_AGE, workItemAgeEntries));
  }

  async createDataset(newDataset: Dataset) {
    this.dbService.selectDb(dataSetDbConfig.name);
    return firstValueFrom(this.dbService.add<Dataset>(TableNames.DATASETS, newDataset));
  }

  getDataset(id: number): Promise<Dataset> {
    this.dbService.selectDb(dataSetDbConfig.name);
    return firstValueFrom(this.dbService.getByID<Dataset>(TableNames.DATASETS, id));
  }

  async saveAppSettings(appSettings: AppSettings): Promise<any> {
    this.dbService.selectDb(dataSetDbConfig.name);
    await firstValueFrom(this.dbService.clear(TableNames.APP_SETTINGS));
    return firstValueFrom(this.dbService.add(TableNames.APP_SETTINGS, appSettings));
  }

  async getAppSettings(): Promise<AppSettings> {
    this.dbService.selectDb(dataSetDbConfig.name);
    return firstValueFrom(this.dbService.getAll<AppSettings>(TableNames.APP_SETTINGS)).then(datasets => datasets[0]);
  }

  //FIXME: this must be dependent on the dataset
  async clearIssueData() {
    this.dbService.selectDb(dbConfigIssueData.name);
    this.dbService.deleteDatabase();
  }

  async clearAllData() {
    this.dbService.selectDb(dbConfigIssueData.name);
    await firstValueFrom(this.dbService.clear(TableNames.ISSUE_HISTORY));
    await firstValueFrom(this.dbService.clear(TableNames.ISSUES));
    await firstValueFrom(this.dbService.clear(TableNames.WORK_ITEM_AGE));
    await firstValueFrom(this.dbService.clear(TableNames.CYCLE_TIME));
  }

  async addIssueHistories(histories: IssueHistory[]): Promise<number[]> {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.bulkAdd(TableNames.ISSUE_HISTORY, histories));
  }

  async getAllIssueHistories(): Promise<IssueHistory[]> {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.getAll<IssueHistory>(TableNames.ISSUE_HISTORY));
  }

  async addCycleTimeEntries(cycleTimes: CycletimeEntry[]) {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.bulkAdd<CycletimeEntry>(TableNames.CYCLE_TIME, cycleTimes ));
  }

  async getCycleTimeData() {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.getAll<CycletimeEntry>(TableNames.CYCLE_TIME));
  }

  async addStatuses(status: Status[]) {
    this.dbService.selectDb(dataSetDbConfig.name);
    return firstValueFrom(this.dbService.bulkAdd<Status>(TableNames.STATUS, status));
  }


  getAllStatuses() {
    this.dbService.selectDb(dataSetDbConfig.name);
    return firstValueFrom(this.dbService.getAll<Status>(TableNames.STATUS));
  }

  updateStatus(status: Status) {
    this.dbService.selectDb(dataSetDbConfig.name);
    return firstValueFrom(this.dbService.update<Status>(TableNames.STATUS, status));

  }

  getAllIssueHistoriesForIssue(issue: Issue) {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.getAllByIndex<IssueHistory>(TableNames.ISSUE_HISTORY, 'issueId', IDBKeyRange.only(issue.id)));
  }

  getAllIssueHistoriesForStatuses() {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.getAllByIndex<IssueHistory>(TableNames.ISSUE_HISTORY, 'field', IDBKeyRange.only("status")));
  }

  async getIssuesByIds(issuesIds: number[]): Promise<Issue[]> {
    this.dbService.selectDb(dbConfigIssueData.name);
    const promises = issuesIds.map(id => firstValueFrom(this.dbService.getByID<Issue>(TableNames.ISSUES, id)));
    return Promise.all(promises);
  }
}
