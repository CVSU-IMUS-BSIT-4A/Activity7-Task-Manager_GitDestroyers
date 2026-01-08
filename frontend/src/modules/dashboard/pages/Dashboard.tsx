import { useEffect, useState } from 'react';
import { tasksApi } from '../../../api/client';
import { Task, TaskStatus } from '../../../api/types';
import { AlertCircle, Clock, CheckCircle2, ListTodo } from 'lucide-react';
import { formatDate, isOverdue, isDueSoon } from '../../../shared/utils/date.utils';
import { TaskListItem } from '../../../shared/components/tasks/TaskListItem';
import { LoadingSpinner } from '../../../shared/components/ui/LoadingSpinner';
import { EmptyState } from '../../../shared/components/ui/EmptyState';
import { Card } from '../../../shared/components/ui/Card';

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tasksApi.findAll().then((res) => {
      setTasks(res.data);
      setLoading(false);
    });
  }, []);

  const overdueTasks = tasks.filter((t) => isOverdue(t.deadline, t.status));
  const dueSoonTasks = tasks.filter((t) => isDueSoon(t.deadline, t.status));

  const stats = [
    {
      label: 'Overdue Tasks',
      value: overdueTasks.length,
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Due Soon (7d)',
      value: dueSoonTasks.length,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Completed',
      value: tasks.filter((t) => t.status === TaskStatus.DONE).length,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Total Tasks',
      value: tasks.length,
      icon: ListTodo,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
    },
  ];

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h2 className="page-title">Dashboard</h2>
        <p className="page-subtitle">Overview of your project and task status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} hover className="stat-card">
            <div className={`stat-icon ${stat.bg}`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="stat-label">{stat.label}</p>
              <p className="stat-value">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="text-red-500" size={20} />
              Overdue Tasks
            </h3>
            <div className="space-y-3">
              {overdueTasks.length === 0 ? (
                <EmptyState message="No overdue tasks. Good job! 🎉" className="text-sm py-4" />
              ) : (
                overdueTasks.slice(0, 5).map((task) => (
                  <TaskListItem key={task.id} task={task} showOverdueBadge={true} />
                ))
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="text-amber-500" size={20} />
              Due Soon
            </h3>
            <div className="space-y-3">
              {dueSoonTasks.length === 0 ? (
                <EmptyState message="No tasks due in the next 7 days." className="text-sm py-4" />
              ) : (
                dueSoonTasks.slice(0, 5).map((task) => (
                  <TaskListItem key={task.id} task={task} showDueSoonBadge={true} />
                ))
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
