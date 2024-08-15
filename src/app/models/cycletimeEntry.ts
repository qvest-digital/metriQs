export interface CycletimeEntry {
  id?: number;
  issueId: number;
  issueKey: string;
  title: string;
  cycleTime: number;
  resolvedState: string;
  resolvedDate: Date;
  inProgressState: string;
  inProgressDate: Date;
}
