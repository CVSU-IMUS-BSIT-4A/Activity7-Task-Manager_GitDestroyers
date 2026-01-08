import { User } from '../../../api/types';

interface AssigneeDisplayProps {
  users: User[];
  assigneeId: string | null | undefined;
  className?: string;
}

export function AssigneeDisplay({ users, assigneeId, className = '' }: AssigneeDisplayProps) {
  const assignee = users.find((u) => u.id === assigneeId);
  
  return (
    <span className={`text-sm text-gray-700 ${className}`}>
      {assignee ? assignee.name : 'Unassigned'}
    </span>
  );
}
