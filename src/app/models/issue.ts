export interface Issue {
  dataSourceId: number;
  issueKey: string;
  title: string;
  createdDate: Date;
  status: string;
  externalStatusId: number;
  id?: number;
  url: string;
}
