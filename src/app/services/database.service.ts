// src/app/services/indexed-db.service.ts
import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Dataset } from '../models/dataset';
import {Issue} from "../models/issue";

export class TableNames {
  static readonly DATASETS = 'datasets';
  static readonly ISSUES = 'issues';
}

interface MetriqsDB extends DBSchema {
  datasets: {
    key: number;
    value: Dataset;
  };
  issues: {
    key: number;
    value: Issue;
  }
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private dbPromise: Promise<IDBPDatabase<MetriqsDB>>;



  constructor() {
    this.dbPromise = openDB<MetriqsDB>('metriqs-database', 1, {
      upgrade(db) {
        db.createObjectStore(TableNames.DATASETS, { keyPath: 'id', autoIncrement: true });
        db.createObjectStore(TableNames.ISSUES, { keyPath: 'id', autoIncrement: true });
      }
    });
  }

  async addDataset(dataset: Dataset): Promise<void> {
    const db = await this.dbPromise;
    await db.clear(TableNames.DATASETS);
    await db.put(TableNames.DATASETS, dataset);
  }

  async getDataset(): Promise<Dataset | undefined> {
    const db = await this.dbPromise;
    return db.getAll(TableNames.DATASETS).then(datasets => datasets[0]);
  }

  async deleteDataset(id: number): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(TableNames.DATASETS, id);
  }

  async getWorkItemAgeData(): Promise<Issue[]> {
    const db = await this.dbPromise;
    return db.getAll(TableNames.ISSUES).then(issues  => issues);
  }

  async addIssues(issues: Issue[]): Promise<void> {
    const db = await this.dbPromise;
    await db.clear(TableNames.ISSUES);
    for (const issue of issues) {
      await db.put(TableNames.ISSUES, issue);
    }
  }
}
