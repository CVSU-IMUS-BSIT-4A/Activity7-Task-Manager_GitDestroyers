import { TaskStatus } from '../../../api/types';

interface StatusSelectProps {
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}

export function StatusSelect({ value, onChange, className = '', size = 'sm' }: StatusSelectProps) {
  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
  };

  const statusStyles = {
    [TaskStatus.TODO]: 'bg-gray-100 text-gray-700',
    [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700',
    [TaskStatus.DONE]: 'bg-emerald-100 text-emerald-700',
  };

  const hasBorder = className.includes('border');
  
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as TaskStatus)}
      className={`${sizeClasses[size]} font-bold rounded ${hasBorder ? 'border border-gray-300 w-full' : 'border-0'} outline-none cursor-pointer ${statusStyles[value]} ${className}`}
      style={hasBorder ? { 
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.5rem center',
        paddingRight: '2rem',
      } : {}}
    >
      <option value={TaskStatus.TODO}>TODO</option>
      <option value={TaskStatus.IN_PROGRESS}>IN PROGRESS</option>
      <option value={TaskStatus.DONE}>DONE</option>
    </select>
  );
}
