import { Clock } from 'lucide-react';
import { TaskStatus } from '../../../api/types';
import { formatDate, isOverdue } from '../../utils/date.utils';

interface DeadlineDisplayProps {
  deadline: string | Date;
  status: TaskStatus;
  className?: string;
  size?: number;
}

export function DeadlineDisplay({ deadline, status, className = '', size = 14 }: DeadlineDisplayProps) {
  const overdue = isOverdue(deadline, status);
  const textColor = overdue ? 'text-red-600 font-bold' : 'text-gray-600';

  return (
    <div className={`flex items-center gap-1.5 text-sm ${textColor} ${className}`}>
      <Clock size={size} />
      {formatDate(deadline)}
    </div>
  );
}
