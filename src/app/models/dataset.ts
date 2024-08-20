export enum DataSetType {
  JIRA_CLOUD = 'JIRA_CLOUD',
  JIRA_DATACENTER = 'JIRA_DATACENTER',
}

//FIXME: rename this to datasource
export interface Dataset {
  type: DataSetType;
  baseUrl: string;
  access_token: string;
  cloudId?: string;
  id?: number;
  jql: string;
  name?: string;
}
