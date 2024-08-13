export interface IssueHistory {
  id?: number;
  issueId: number;
  fromValue: string;
  toValue: string;
  field: string;
  createdDate: Date;
}
