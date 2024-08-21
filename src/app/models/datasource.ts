export enum DatasourceType {
  JIRA_CLOUD = 'JIRA_CLOUD',
  JIRA_DATACENTER = 'JIRA_DATACENTER',
}

//FIXME: rename this to datasource
export interface Datasource {
  type: DatasourceType;
  baseUrl: string;
  access_token: string;
  cloudId?: string;
  id?: number;
  jql: string;
  name?: string;
}
