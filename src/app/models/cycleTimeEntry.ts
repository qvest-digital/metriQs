// a cycle is started if the issue switches into a inProgressState from a state that is not inProgressState
// because of this, it's possible that some issues has multiple cycles
export interface CycleTimeEntry {
  datasourceId: number;
  id?: number;
  issueId: number;
  issueKey: string;
  title: string;
  cycleTime: number;
  status: string;
  externalStatusId: number;
  resolvedState: string;
  resolvedDate: Date;
  externalResolvedStatusId: number;
  inProgressState: string;
  inProgressDate: Date;
  externalInProgressStatusId: number;
}
