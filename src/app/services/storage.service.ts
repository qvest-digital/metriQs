import {Injectable} from '@angular/core';
import {Datasource} from '../models/datasource';
import {Issue} from "../models/issue";
import {WorkItemAgeEntry} from "../models/workItemAgeEntry";
import {DBConfig, NgxIndexedDBService} from 'ngx-indexed-db';
import {firstValueFrom} from "rxjs";
import {AppSettings} from "../models/appSettings";
import {IssueHistory} from "../models/issueHistory";
import {CycleTimeEntry} from "../models/cycleTimeEntry";
import {Status} from "../models/status";
import {ThroughputEntry} from "../models/throughputEntry";
import {CanceledCycleEntry} from "../models/canceledCycleEntry";
import {WorkInProgressEntry} from "../models/workInProgressEntry";

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
  static readonly WORK_IN_PROGRESS = 'workInProgress';
}

export const dbConfigCore: DBConfig = {
  name: 'metriqs-database-core',
  version: 1,
  migrationFactory: migrationFactoryCore,
  objectStoresMeta: [{
    store: TableNames.DATASOURCES,
    storeConfig: {keyPath: 'id', autoIncrement: true},
    storeSchema: []
  }, {
    store: TableNames.APP_SETTINGS,
    storeConfig: {keyPath: 'id', autoIncrement: true}, storeSchema: []
  }, {
    store: TableNames.STATUS,
    storeConfig: {keyPath: 'id', autoIncrement: true}, storeSchema: [
      {name: 'name', keypath: 'name', options: {unique: false}},
      {name: 'category', keypath: 'category', options: {unique: false}},
      {name: 'datasourceId', keypath: 'datasourceId', options: {unique: false}},
    ]
  },
  ]
};

export const dbConfigIssueData: DBConfig = {
  name: 'metriqs-database-issue-data',
  version: 1,
  migrationFactory: migrationFactoryIssues,
  objectStoresMeta: [{
    store: TableNames.ISSUES,
    storeConfig: {keyPath: 'id', autoIncrement: true}, storeSchema: [
      {name: 'datasourceId', keypath: 'datasourceId', options: {unique: false}},
      {name: 'issueKey', keypath: 'issueKey', options: {unique: false}},
      {name: 'id', keypath: 'id', options: {unique: false}},
    ]
  }, {
    store: TableNames.WORK_ITEM_AGE,
    storeConfig: {keyPath: 'id', autoIncrement: true}, storeSchema: [
      {name: 'issueId', keypath: 'issueId', options: {unique: false}},
      {name: 'status', keypath: 'status', options: {unique: false}},
      {name: 'datasourceId', keypath: 'datasourceId', options: {unique: false}},
    ]
  }, {
    store: TableNames.ISSUE_HISTORY,
    storeConfig: {keyPath: 'id', autoIncrement: true}, storeSchema: [
      {name: 'issueId', keypath: 'issueId', options: {unique: false}},
      {name: 'field', keypath: 'field', options: {unique: false}},
      {name: 'datasourceId', keypath: 'datasourceId', options: {unique: false}},
    ]
  },
    {
      store: TableNames.CYCLE_TIME,
      storeConfig: {keyPath: 'id', autoIncrement: true}, storeSchema: [
        {name: 'issueId', keypath: 'issueId', options: {unique: false}},
        {name: 'datasourceId', keypath: 'datasourceId', options: {unique: false}},
      ]
    },
    {
      store: TableNames.CANCELED_CYCLE,
      storeConfig: {keyPath: 'id', autoIncrement: true}, storeSchema: [
        {name: 'issueId', keypath: 'issueId', options: {unique: false}},
        {name: 'datasourceId', keypath: 'datasourceId', options: {unique: false}},
      ]
    },
    {
      store: TableNames.THROUGHPUT,
      storeConfig: {keyPath: 'id', autoIncrement: true}, storeSchema: [
        {name: 'issueId', keypath: 'issueId', options: {unique: false}},
        {name: 'datasourceId', keypath: 'datasourceId', options: {unique: false}},
      ]
    }, {
      store: TableNames.WORK_IN_PROGRESS,
      storeConfig: {keyPath: 'id', autoIncrement: true}, storeSchema: [
        {name: 'datasourceId', keypath: 'datasourceId', options: {unique: false}},
      ]
    },
  ]
};


// Ahead of time compiles requires an exported function for factories
export function migrationFactoryIssues() {
  return {
    1: (db: any, transaction: { objectStore: (arg0: string) => any; }) => {
      transaction.objectStore(TableNames.ISSUES);
      transaction.objectStore(TableNames.WORK_ITEM_AGE);
      transaction.objectStore(TableNames.ISSUE_HISTORY);
      transaction.objectStore(TableNames.CYCLE_TIME);
      transaction.objectStore(TableNames.CANCELED_CYCLE);
      transaction.objectStore(TableNames.THROUGHPUT);
    },
  };
}

export function migrationFactoryCore() {
  return {
    1: (db: any, transaction: { objectStore: (arg0: string) => any; }) => {
      transaction.objectStore(TableNames.DATASOURCES);
      transaction.objectStore(TableNames.APP_SETTINGS);
      transaction.objectStore(TableNames.STATUS);
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
        const store = await this.dbService.createObjectStore(storeMeta, migrationFactoryIssues);
        // storeMeta.storeSchema.forEach(schema => {
        //   store.createIndex(schema.name, schema.keypath, schema.options);
        // });
      }
      return true;
    });
  }

  async addDatasource(datasource: Datasource): Promise<Datasource> {
    this.dbService.selectDb(dbConfigCore.name);
    return firstValueFrom(this.dbService.add(TableNames.DATASOURCES, datasource));
  }

  async getAllDatasources(): Promise<Datasource[]> {
    this.dbService.selectDb(dbConfigCore.name);
    return firstValueFrom(this.dbService.getAll<Datasource>(TableNames.DATASOURCES));
  }

  async removeDatasource(id: number): Promise<void> {
    this.dbService.selectDb(dbConfigCore.name);
    await firstValueFrom(this.dbService.delete(TableNames.DATASOURCES, id));
  }

  async updateDatasource(datasource: Datasource): Promise<Datasource> {
    this.dbService.selectDb(dbConfigCore.name);
    return await firstValueFrom(this.dbService.update(TableNames.DATASOURCES, datasource));
  }

  async getAllIssues(datasourceId: number): Promise<Issue[]> {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.getAllByIndex<Issue>(TableNames.ISSUES, 'datasourceId', IDBKeyRange.only(datasourceId)));
  }

  async getWorkItemAgeData(datasourceId: number): Promise<WorkItemAgeEntry[]> {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.getAllByIndex<WorkItemAgeEntry>(TableNames.WORK_ITEM_AGE, 'datasourceId', IDBKeyRange.only(datasourceId)));
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

  async createDatasource(datasource: Datasource) {
    this.dbService.selectDb(dbConfigCore.name);
    return firstValueFrom(this.dbService.add<Datasource>(TableNames.DATASOURCES, datasource));
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
    return firstValueFrom(this.dbService.getAll<AppSettings>(TableNames.APP_SETTINGS)).then(settings => settings[0]);
  }

  async deleteIssueDatabase() {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.deleteDatabase());
  }

  async clearAllIssueData(datasourceId: number) {
    this.dbService.selectDb(dbConfigIssueData.name);

    const tables = [
      TableNames.ISSUES,
      TableNames.ISSUE_HISTORY,
      TableNames.WORK_ITEM_AGE,
      TableNames.CYCLE_TIME,
      TableNames.CANCELED_CYCLE,
      TableNames.THROUGHPUT,
      TableNames.WORK_IN_PROGRESS
    ];

    for (const table of tables) {
      const entries = await firstValueFrom(this.dbService.getAllByIndex(table, 'datasourceId', IDBKeyRange.only(datasourceId)));
      for (const entry of entries) {
        await firstValueFrom(this.dbService.delete(table, (entry as any).id));
      }
    }
  }

  async addIssueHistories(histories: IssueHistory[]): Promise<number[]> {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.bulkAdd(TableNames.ISSUE_HISTORY, histories));
  }

  async getAllIssueHistories(datasourceId: number): Promise<IssueHistory[]> {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.getAllByIndex<IssueHistory>(TableNames.ISSUE_HISTORY, 'datasourceId', IDBKeyRange.only(datasourceId)));
  }

  async addCycleTimeEntries(cycleTimes: CycleTimeEntry[]) {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.bulkAdd<CycleTimeEntry>(TableNames.CYCLE_TIME, cycleTimes));
  }

  async getCycleTimeData(datasourceId: number) {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.getAllByIndex<CycleTimeEntry>(TableNames.CYCLE_TIME, 'datasourceId', IDBKeyRange.only(datasourceId)));
  }

  async addStatuses(status: Status[]) {
    this.dbService.selectDb(dbConfigCore.name);
    return firstValueFrom(this.dbService.bulkAdd<Status>(TableNames.STATUS, status));
  }

  async getThroughputData(datasourceId: number): Promise<ThroughputEntry[]> {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.getAllByIndex<ThroughputEntry>(TableNames.THROUGHPUT, 'datasourceId', IDBKeyRange.only(datasourceId)));
  }

  async addThroughputData(throughput: ThroughputEntry[]): Promise<number[]> {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.bulkAdd<ThroughputEntry>(TableNames.THROUGHPUT, throughput));
  }


  getAllStatuses(datasourceId: number) {
    this.dbService.selectDb(dbConfigCore.name);
    return firstValueFrom(this.dbService.getAllByIndex<Status>(TableNames.STATUS, 'datasourceId', IDBKeyRange.only(datasourceId)));
  }

  updateStatus(status: Status) {
    this.dbService.selectDb(dbConfigCore.name);
    return firstValueFrom(this.dbService.update<Status>(TableNames.STATUS, status));

  }

  getAllIssueHistoriesForIssue(issue: Issue) {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.getAllByIndex<IssueHistory>(TableNames.ISSUE_HISTORY, 'issueId', IDBKeyRange.only(issue.id)));
  }

  async getAllIssueHistoriesForStatuses(datasourceId: number): Promise<IssueHistory[]> {
    this.dbService.selectDb(dbConfigIssueData.name);
    const issueHistories = await firstValueFrom(this.dbService.getAllByIndex<IssueHistory>(TableNames.ISSUE_HISTORY, 'field', IDBKeyRange.only('status')));
    return issueHistories.filter(history => history.datasourceId === datasourceId);
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

  async getWorkInProgressData(datasourceId: number): Promise<WorkInProgressEntry[]> {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.getAllByIndex<WorkInProgressEntry>(TableNames.WORK_IN_PROGRESS, 'datasourceId', IDBKeyRange.only(datasourceId)));
  }

  saveWorkInProgressData(workInProgressEntries: WorkInProgressEntry[]) {
    this.dbService.selectDb(dbConfigIssueData.name);
    return firstValueFrom(this.dbService.bulkAdd<WorkInProgressEntry>(TableNames.WORK_IN_PROGRESS, workInProgressEntries));
  }
}
