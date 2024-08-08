// src/app/models/configuration.ts
export enum DataSetType {
  JIRA_CLOUD = 'JIRA_CLOUD',
  JIRA_SERVER = 'JIRA_SERVER',
}

export interface Dataset {
  type: DataSetType;
  baseUrl: string;
  access_token: string;
  cloudId: string;
  id?: number;
  jql: string;
  name?: string;
}
