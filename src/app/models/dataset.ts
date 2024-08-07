// src/app/models/configuration.ts
export interface Dataset {
  useJira: boolean;
  url: string;
  access_token: string;
  cloudId: string;
  id?: number;
  jql: string;
}
