import { WorkLog } from './work-log.interface';

export interface Task {
  id: string;
  workLogs: WorkLog[];
}
