import {Injectable} from '@angular/core';
import {Datasource} from '../models/datasource';
import {Issue} from "../models/issue";
import {WorkItemAgeEntry} from "../models/workItemAgeEntry";
import {NgxIndexedDBModule, DBConfig, NgxIndexedDBService} from 'ngx-indexed-db';
import {firstValueFrom} from "rxjs";
import {AppSettings} from "../models/appSettings";
import {IssueHistory} from "../models/issueHistory";
import {CycleTimeEntry} from "../models/cycleTimeEntry";
import {Status} from "../models/status";
import {ThroughputEntry} from "../models/throughputEntry";
import {CanceledCycleEntry} from "../models/canceledCycleEntry";

export class TableNames {
  static readonly DATASOURCES = 'datasources';
  static readonly ISSUES = 'issues';
  static readonly WORK_ITEM_AGE = 'workItemAges';
  static readonly APP_SETTINGS = 'appSettings';
  static readonly ISSUE_HISTORY = 'issueHistories';
  static readonly CYCLE_TIME = 'cycleTimes';
  static readonly STATUS = 'status';
  static readonly THROUGHPUT = 'throughputs';
  static readonly CANCELED_CYCLE = 'canceledCycles';
}

export const dbConfigCore: DBConfig = {
  name: 'metriqs-database-core',
  version: 1,
  migrationFactory: migrationFactoryDataset,
  objectStoresMeta: [{
    store: TableNames.DATASOURCES,
    storeConfig: {keyPath: 'id', autoIncrement: true},
    storeSchema: [
      {name: 'url', keypath: 'url', options: {unique: false}},
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
      {name: 'dataSourceId', keypath: 'dataSourceId', options: {unique: false}},
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
    {
      store: TableNames.CANCELED_CYCLE,
      storeConfig: {keyPath: 'id', autoIncrement: true}, storeSchema: [
        {name: 'issueId', keypath: 'issueId', options: {unique: false}},
      ]
    },
    {
      store: TableNames.THROUGHPUT,
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
      const canceled = transaction.objectStore(TableNames.CANCELED_CYCLE);
      const throughput = transaction.objectStore(TableNames.THROUGHPUT);
    },
  };
}

export function migrationFactoryDataset() {
  // The animal table was added with version 2 but none of the existing tables or data needed
  // to be modified so a migrator for that version is not included.
  return {
    1: (db: any, transaction: { objectStore: (arg0: string) => any; }) => {
      const issues = transaction.objectStore(TableNames.DATASOURCES);
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

  async recreateDatabase(): Promise<boolean> {
    return this.deleteIssueDatabase().then(async () => {
      for (const storeMeta of dbConfigIssueData.objectStoresMeta) {
        const store = await this.dbService.createObjectStore(storeMeta, migrationFactory);
        // storeMeta.storeSchema.forEach(schema => {
        //   store.createIndex(schema.name, schema.keypath, schema.options);
        // });
      }
      return true;
    });
  }

  async addDataset(dataset: Datasource): Promise<Datasource> {
    this.dbService.selectDb(dbConfigCore.name);
    return firstValueFrom(this.dbService.add(TableNames.DATASOURCES, dataset));
  }

  async getAllDatasources(): Promise<Datasource[]> {
    this.dbService.selectDb(dbConfigCore.name);
    return firstValueFrom(this.dbService.getAll<Datasource>(TableNames.DATASOURCES));
  }

  async removeDatasource(id: number): Promise<void> {
    this.dbService.selectDb(dbConfigCore.name);
    await firstValueFrom(this.dbService.delete(TableNames.DATASOURCES, id));
  }

  async updateDatasource(dataset: Datasource): Promise<Datasource> {
    this.dbService.selectDb(dbConfigCore.name);
    return await firstValueFrom(this.dbService.update(TableNames.DATASOURCES, dataset));
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

  async createDataset(newDataset: Datasource) {
    this.dbService.selectDb(dbConfigCore.name);
    return firstValueFrom(this.dbService.add<Datasource>(TableNames.DATASOURCES, newDataset));
  }

  getDatasource(id: number): Promise<Datasource> {
    this.dbService.selectDb(dbConfigCore.name);
    return firstValueFrom(this.dbService.getByID<Datasource>(TableNames.DATASOURCES, id));
  }

  async saveAppSettings(appSettings: AppSettings): Promise<any> {
    this.dbService.selectDb(dbConfigCore.name);
    await firstValueFrom(this.dbService.clear(TableNames.APP_SETTINGS));
    return firstValueFrom(this.dbService.add(TableNames.APP_SETTINGS, appSettings));
  }

  async getAppSettings(): Promise<AppSettings> {
    this.dbService.selectDb(dbConfigCore.name);
    return firstValueFrom(this.dbService.getAll<AppSettings>(TableNames.APP_SETTINGS)).then(datasets => datasets[0]);
  }

  async deleteIssueDatabase() {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.deleteDatabase());
  }

  async clearAllData() {
    this.dbService.selectDb(dbConfigIssueData.name);
    await firstValueFrom(this.dbService.clear(TableNames.ISSUE_HISTORY));
    await firstValueFrom(this.dbService.clear(TableNames.ISSUES));
    await firstValueFrom(this.dbService.clear(TableNames.WORK_ITEM_AGE));
    await firstValueFrom(this.dbService.clear(TableNames.CYCLE_TIME));
    await firstValueFrom(this.dbService.clear(TableNames.THROUGHPUT));
  }

  async addIssueHistories(histories: IssueHistory[]): Promise<number[]> {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.bulkAdd(TableNames.ISSUE_HISTORY, histories));
  }

  async getAllIssueHistories(): Promise<IssueHistory[]> {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.getAll<IssueHistory>(TableNames.ISSUE_HISTORY));
  }

  async addCycleTimeEntries(cycleTimes: CycleTimeEntry[]) {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.bulkAdd<CycleTimeEntry>(TableNames.CYCLE_TIME, cycleTimes));
  }

  async getCycleTimeData() {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.getAll<CycleTimeEntry>(TableNames.CYCLE_TIME));
  }

  async addStatuses(status: Status[]) {
    this.dbService.selectDb(dbConfigCore.name);
    return firstValueFrom(this.dbService.bulkAdd<Status>(TableNames.STATUS, status));
  }

  async getThroughputData(): Promise<ThroughputEntry[]> {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.getAll<ThroughputEntry>(TableNames.THROUGHPUT));
  }

  async addThroughputData(throughput: ThroughputEntry[]): Promise<number[]> {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.bulkAdd<ThroughputEntry>(TableNames.THROUGHPUT, throughput));
  }


  getAllStatuses() {
    this.dbService.selectDb(dbConfigCore.name);
    return firstValueFrom(this.dbService.getAll<Status>(TableNames.STATUS));
  }

  updateStatus(status: Status) {
    this.dbService.selectDb(dbConfigCore.name);
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

  async addCanceledCycleEntries(canEntries: CanceledCycleEntry[]) {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.bulkAdd<CanceledCycleEntry>(TableNames.CANCELED_CYCLE, canEntries));

  }

  async saveThroughputData(througputs: ThroughputEntry[]) {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.bulkAdd<ThroughputEntry>(TableNames.THROUGHPUT, througputs));
  }
}
