export interface Issue {
  dataSetId: number;
  issueKey: string;
  title: string;
  createdDate: Date;
  status: string;
  externalStatusId: number;
  id?: number;
  url: string;
}
