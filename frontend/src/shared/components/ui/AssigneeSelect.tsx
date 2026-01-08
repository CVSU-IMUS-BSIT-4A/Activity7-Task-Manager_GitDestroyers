import { User } from '../../../api/types';

interface AssigneeSelectProps {
  users: User[];
  value: string | null | undefined;
  onChange: (assigneeId: string | null) => void;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}

export function AssigneeSelect({ users, value, onChange, className = '', size = 'sm' }: AssigneeSelectProps) {
  const sizeClasses = {
    xs: 'text-xs px-2 py-1',
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-2',
  };

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      className={`${sizeClasses[size]} border border-gray-300 rounded outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
    >
      <option value="">Unassigned</option>
      {users.map((u) => (
        <option key={u.id} value={u.id}>
          {u.name}
        </option>
      ))}
    </select>
  );
}
