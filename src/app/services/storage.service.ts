// src/app/services/indexed-db.service.ts
import {Injectable} from '@angular/core';
import {Dataset} from '../models/dataset';
import {Issue} from "../models/issue";
import {WorkItemAgeEntry} from "../models/workItemAgeEntry";
import {NgxIndexedDBModule, DBConfig, NgxIndexedDBService} from 'ngx-indexed-db';
import {firstValueFrom} from "rxjs";

export class TableNames {
  static readonly DATASETS = 'datasets';
  static readonly ISSUES = 'issues';
  static readonly WORK_ITEM_AGE = 'workItemAge';
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
    }]
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
    await firstValueFrom(this.dbService.clear(TableNames.DATASETS));
    return firstValueFrom(this.dbService.add(TableNames.DATASETS, dataset));
  }

  async getDataset(): Promise<Dataset> {
    return firstValueFrom(this.dbService.getAll<Dataset>(TableNames.DATASETS)).then(datasets => datasets[0]);
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

  async addIssues(issues: Issue[]): Promise<number[]> {
    await firstValueFrom(this.dbService.clear(TableNames.ISSUES));
    return firstValueFrom(this.dbService.bulkAdd(TableNames.ISSUES, issues));
  }

  async addWorkItemAgeData(workItemAgeEntries: WorkItemAgeEntry[]): Promise<number[]> {
    await firstValueFrom(this.dbService.clear(TableNames.WORK_ITEM_AGE));
    return firstValueFrom(this.dbService.bulkAdd(TableNames.WORK_ITEM_AGE, workItemAgeEntries));
  }

}
