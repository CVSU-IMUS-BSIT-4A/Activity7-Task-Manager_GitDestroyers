import { TaskStatus } from '../../api/types';

export interface TaskFilters {
  projectId?: string;
  assigneeId?: string;
  status?: TaskStatus | '';
  overdue?: boolean;
}
