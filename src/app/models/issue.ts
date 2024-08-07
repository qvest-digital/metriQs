export interface Issue {
  dataSetId: number;
  issueKey: string;
  title: string;
  createdDate: Date;
  status: string;
  id?: number;
  url: string;
}
