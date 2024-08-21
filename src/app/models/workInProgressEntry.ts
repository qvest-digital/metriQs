export interface WorkInProgressEntry {
  datasourceId: number;
  issueIds: number[];
  wip: number;
  date: Date;
  id?: number;
}
