export enum DataSourceType {
  JIRA_CLOUD = 'JIRA_CLOUD',
  JIRA_DATACENTER = 'JIRA_DATACENTER',
}

//FIXME: rename this to datasource
export interface Datasource {
  type: DataSourceType;
  baseUrl: string;
  access_token: string;
  cloudId?: string;
  id?: number;
  jql: string;
  name?: string;
}
