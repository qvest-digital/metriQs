export interface ThroughputEntry {
  datasourceId: number;
  issueIds: number[];
  throughput: number;
  date: Date;
  id?: number;
}
