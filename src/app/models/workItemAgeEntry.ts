export interface WorkItemAgeEntry {
  issueId: number;
  issueKey: string;
  title: string;
  age: number;
  status: string;
  externalStatusId: number;
  id?: number;
  inProgressStatusDate: Date;
}
