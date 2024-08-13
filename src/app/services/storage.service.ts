import {Injectable} from '@angular/core';
import {Dataset} from '../models/dataset';
import {Issue} from "../models/issue";
import {WorkItemAgeEntry} from "../models/workItemAgeEntry";
import {NgxIndexedDBModule, DBConfig, NgxIndexedDBService} from 'ngx-indexed-db';
import {firstValueFrom} from "rxjs";
import {AppSettings} from "../models/appSettings";
import {IssueHistory} from "../models/IssueHistory";

export class TableNames {
  static readonly DATASETS = 'datasets';
  static readonly ISSUES = 'issues';
  static readonly WORK_ITEM_AGE = 'workItemAge';
  static readonly APP_SETTINGS = 'appSettings';
  static readonly ISSUE_HISTORY = 'issueHistory';
  static readonly CYCLE_TIME = 'cycleTime';
}

export const dbConfig: DBConfig = {
  name: 'metriqs-database',
  version: 1,
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
    store: TableNames.ISSUES,
    storeConfig: {keyPath: 'id', autoIncrement: true}, storeSchema: [
      {name: 'dataSetId', keypath: 'dataSetId', options: { unique: false}},
      {name: 'issueKey', keypath: 'key', options: {unique: false}},
    ]
  }, {
      store: TableNames.WORK_ITEM_AGE,
      storeConfig: {keyPath: 'id', autoIncrement: true}, storeSchema: [
        {name: 'issueId', keypath: 'issueId', options: {unique: false}},
      ]
  }, {
    store: TableNames.APP_SETTINGS,
    storeConfig: {keyPath: 'id', autoIncrement: true}, storeSchema: []
  }, {
    store: TableNames.ISSUE_HISTORY,
    storeConfig: {keyPath: 'id', autoIncrement: true}, storeSchema: [
      {name: 'issueId', keypath: 'issueId', options: {unique: false}},
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
  // The animal table was added with version 2 but none of the existing tables or data needed
  // to be modified so a migrator for that version is not included.
  return {
    1: (db: any, transaction: { objectStore: (arg0: string) => any; }) => {
      const dataset = transaction.objectStore(TableNames.DATASETS);
      const issues = transaction.objectStore(TableNames.ISSUES);
      const workItems = transaction.objectStore(TableNames.WORK_ITEM_AGE);
      const settings = transaction.objectStore(TableNames.APP_SETTINGS);
      const issueHistory = transaction.objectStore(TableNames.ISSUE_HISTORY);
      const cycleTime = transaction.objectStore(TableNames.CYCLE_TIME);
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
    return firstValueFrom(this.dbService.add(TableNames.DATASETS, dataset));
  }

  async getAllDatasets(): Promise<Dataset[]> {
    return firstValueFrom(this.dbService.getAll<Dataset>(TableNames.DATASETS));
  }

  async removeDataset(id: number): Promise<void> {
    await firstValueFrom(this.dbService.delete(TableNames.DATASETS, id));
  }

  async updateDataset(dataset: Dataset): Promise<Dataset> {
    return await firstValueFrom(this.dbService.update(TableNames.DATASETS, dataset));
  }
  async hasWorkItemAgeData(): Promise<boolean> {
    return await firstValueFrom(this.dbService.count(TableNames.WORK_ITEM_AGE)) > 0;
  }

  async getAllIssues(): Promise<Issue[]> {
    return firstValueFrom(this.dbService.getAll(TableNames.ISSUES));
  }

  async getWorkItemAgeData(): Promise<WorkItemAgeEntry[]> {
    return firstValueFrom(this.dbService.getAll(TableNames.WORK_ITEM_AGE));
  }

  async addissue(issue: Issue): Promise<Issue> {
    return firstValueFrom(this.dbService.add(TableNames.ISSUES, issue));
  }

  async addIssues(issues: Issue[]): Promise<number[]> {
    await firstValueFrom(this.dbService.clear(TableNames.ISSUES));
    return firstValueFrom(this.dbService.bulkAdd(TableNames.ISSUES, issues));
  }

  async addWorkItemAgeData(workItemAgeEntries: WorkItemAgeEntry[]): Promise<number[]> {
    await firstValueFrom(this.dbService.clear(TableNames.WORK_ITEM_AGE));
    return firstValueFrom(this.dbService.bulkAdd(TableNames.WORK_ITEM_AGE, workItemAgeEntries));
  }

  async getFirstDataset() {
    const datasets = await this.getAllDatasets();
    return datasets[0];
  }

  getDataset(id: number): Promise<Dataset> {
    return firstValueFrom(this.dbService.getByID<Dataset>(TableNames.DATASETS, id));
  }

  async saveAppSettings(appSettings: AppSettings): Promise<any> {
    await firstValueFrom(this.dbService.clear(TableNames.APP_SETTINGS));
    return firstValueFrom(this.dbService.add(TableNames.APP_SETTINGS, appSettings));
  }

  async getAppSettings(): Promise<AppSettings> {
    return firstValueFrom(this.dbService.getAll<AppSettings>(TableNames.APP_SETTINGS)).then(datasets => datasets[0]);
  }

  //FIXME: this must be dependent on the dataset
  async clearIssueData() {
    await firstValueFrom(this.dbService.clear(TableNames.ISSUES));
    await firstValueFrom(this.dbService.clear(TableNames.ISSUE_HISTORY));
    await firstValueFrom(this.dbService.clear(TableNames.WORK_ITEM_AGE));
    await firstValueFrom(this.dbService.clear(TableNames.WORK_ITEM_AGE));
  }

  async clearAllData() {
    //FIXME ???
    //   await firstValueFrom(this.dbService.deleteDatabase());
  }

  async addIssueHistories(histories: IssueHistory[]): Promise<number[]> {
    return firstValueFrom(this.dbService.bulkAdd(TableNames.ISSUE_HISTORY, histories));
  }

  async getAllIssueHistories(): Promise<IssueHistory[]> {
    return firstValueFrom(this.dbService.getAll<IssueHistory>(TableNames.ISSUE_HISTORY));
  }

}
