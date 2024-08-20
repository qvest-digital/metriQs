export interface WorkItemAgeEntry {
  id?: number;
  issueId: number;
  issueKey: string;
  title: string;
  age: number;
  status: string;
  externalStatusId: number;
  inProgressState: string;
  inProgressDate: Date;
  externalInProgressStatusId: number;
}
