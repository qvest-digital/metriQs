export enum StatusCategory {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  Done = 'Done',
}

export interface Status {
  dataSetId: number;
  id?: number;
  name: string;
  color?: string;
  order?: number;
  category?: StatusCategory;
}
