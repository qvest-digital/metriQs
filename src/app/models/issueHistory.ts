export interface IssueHistory {
  datasetId: number;
  id?: number;
  issueId: number;
  fromValue: string;
  toValue: string;
  field: string;
  createdDate: Date;
}
