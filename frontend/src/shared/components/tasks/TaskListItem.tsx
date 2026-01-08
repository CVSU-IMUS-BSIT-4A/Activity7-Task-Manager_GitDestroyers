import { Task, TaskStatus } from '../../../api/types';
import { formatDate, isOverdue, isDueSoon } from '../../utils/date.utils';

interface TaskListItemProps {
  task: Task;
  showOverdueBadge?: boolean;
  showDueSoonBadge?: boolean;
}

export function TaskListItem({ 
  task, 
  showOverdueBadge = false, 
  showDueSoonBadge = false 
}: TaskListItemProps) {
  const overdue = isOverdue(task.deadline, task.status);
  const dueSoon = showDueSoonBadge && isDueSoon(task.deadline, task.status) && !overdue;

  return (
    <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-all">
      <div>
        <p className="font-semibold text-gray-800">{task.title}</p>
        <p className="text-xs text-gray-500">
          {task.project?.name} • Due {formatDate(task.deadline)}
        </p>
      </div>
      {showOverdueBadge && overdue && (
        <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-700 rounded uppercase tracking-wider">
          Overdue
        </span>
      )}
      {showDueSoonBadge && dueSoon && (
        <span className="text-xs font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded uppercase tracking-wider">
          Due Soon
        </span>
      )}
    </div>
  );
}
