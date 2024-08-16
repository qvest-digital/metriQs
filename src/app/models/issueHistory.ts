export interface IssueHistory {
  datasetId: number;
  id?: number;
  issueId: number;
  fromValue: string;
  fromValueId?: number;
  toValue: string;
  field: string;
  createdDate: Date;
  toValueId?: number;
}
