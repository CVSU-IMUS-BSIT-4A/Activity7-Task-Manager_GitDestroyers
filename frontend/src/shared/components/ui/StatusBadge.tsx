import { TaskStatus } from '../../../api/types';

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const styles = {
    [TaskStatus.TODO]: 'bg-gray-100 text-gray-700',
    [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700',
    [TaskStatus.DONE]: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${styles[status]} ${className}`}>
      {status}
    </span>
  );
}
