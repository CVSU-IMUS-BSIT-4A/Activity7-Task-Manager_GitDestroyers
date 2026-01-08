import { useEffect, useState } from 'react';
import { tasksApi, projectsApi, usersApi } from '../../../api/client';
import { Task, Project, User, TaskStatus } from '../../../api/types';
import { Filter, Folder, Edit2, Trash2 } from 'lucide-react';
import { StatusSelect } from '../../../shared/components/ui/StatusSelect';
import { AssigneeSelect } from '../../../shared/components/ui/AssigneeSelect';
import { AssigneeDisplay } from '../../../shared/components/ui/AssigneeDisplay';
import { DeadlineDisplay } from '../../../shared/components/ui/DeadlineDisplay';
import { StatusBadge } from '../../../shared/components/ui/StatusBadge';
import { useConfirm } from '../../../shared/hooks/useConfirm';
import { LoadingSpinner } from '../../../shared/components/ui/LoadingSpinner';
import { EmptyState } from '../../../shared/components/ui/EmptyState';
import { TaskFilters } from '../types';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { ConfirmDialog } from '../../../shared/components/ui/ConfirmDialog';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTask, setEditTask] = useState({
    title: '',
    description: '',
    deadline: '',
    assigneeId: '',
    status: TaskStatus.TODO,
  });

  const [filters, setFilters] = useState<TaskFilters>({
    projectId: '',
    assigneeId: '',
    status: '',
    overdue: false,
  });
  const { confirmDelete, isOpen, options, handleConfirm, handleCancel } = useConfirm();

  useEffect(() => {
    Promise.all([
      projectsApi.findAll(),
      usersApi.findAll(),
    ]).then(([projRes, usersRes]) => {
      setProjects(projRes.data);
      setUsers(usersRes.data);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const cleanFilters: any = {};
    if (filters.projectId) cleanFilters.projectId = filters.projectId;
    if (filters.assigneeId) cleanFilters.assigneeId = filters.assigneeId;
    if (filters.status) cleanFilters.status = filters.status;
    if (filters.overdue) cleanFilters.overdue = 'true';

    tasksApi.findAll(cleanFilters).then((res) => {
      setTasks(res.data);
      setLoading(false);
    });
  }, [filters]);

  const handleEdit = (task: Task) => {
    setEditingId(task.id);
    setEditTask({
      title: task.title,
      description: task.description || '',
      deadline: new Date(task.deadline).toISOString().split('T')[0],
      assigneeId: task.assigneeId || '',
      status: task.status,
    });
  };

  const handleUpdate = async (taskId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editTask.title.trim()) return;
    await tasksApi.update(taskId, {
      title: editTask.title,
      description: editTask.description,
      deadline: editTask.deadline,
      assigneeId: editTask.assigneeId || null,
      status: editTask.status,
    });
    setEditingId(null);
    const tasksRes = await tasksApi.findAll(filters.projectId ? { projectId: filters.projectId } : {});
    setTasks(tasksRes.data);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTask({ title: '', description: '', deadline: '', assigneeId: '', status: TaskStatus.TODO });
  };

  const handleDelete = async (taskId: string) => {
    const confirmed = await confirmDelete('Delete this task?');
    if (confirmed) {
      try {
        await tasksApi.remove(taskId);
        const tasksRes = await tasksApi.findAll(filters.projectId ? { projectId: filters.projectId } : {});
        setTasks(tasksRes.data);
      } catch (error: any) {
        alert(error?.response?.data?.message || 'Error deleting task.');
      }
    }
  };


  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">All Tasks</h2>
        <p className="page-subtitle">View and filter tasks across all projects.</p>
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-gray-500 mr-2">
            <Filter size={18} />
            <span className="text-sm font-semibold uppercase tracking-wider">Filters</span>
          </div>
          
          <select
            value={filters.projectId}
            onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          >
            <option value="">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <select
            value={filters.assigneeId}
            onChange={(e) => setFilters({ ...filters, assigneeId: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          >
            <option value="">All Assignees</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as TaskStatus | '' })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          >
            <option value="">All Statuses</option>
            <option value={TaskStatus.TODO}>TODO</option>
            <option value={TaskStatus.IN_PROGRESS}>IN PROGRESS</option>
            <option value={TaskStatus.DONE}>DONE</option>
          </select>

          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.overdue}
              onChange={(e) => setFilters({ ...filters, overdue: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-gray-700">Overdue only</span>
          </label>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 py-12">
            <LoadingSpinner message="Loading tasks..." />
          </div>
        ) : tasks.length === 0 ? (
          <div className="col-span-2 py-12">
            <EmptyState message="No tasks match your filters." />
          </div>
        ) : (
          tasks.map((task) => {
            const isEditing = editingId === task.id;
            
            if (isEditing) {
              return (
                <Card key={task.id} className="bg-emerald-50 border-2 border-emerald-200 p-5">
                  <form onSubmit={(e) => handleUpdate(task.id, e)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Title</label>
                        <input
                          required
                          type="text"
                          value={editTask.title}
                          onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Status</label>
                        <StatusSelect
                          value={editTask.status}
                          onChange={(status) => setEditTask({ ...editTask, status })}
                          size="md"
                          className="border border-gray-300 w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Assignee</label>
                        <AssigneeSelect
                          users={users}
                          value={editTask.assigneeId}
                          onChange={(assigneeId) => setEditTask({ ...editTask, assigneeId: assigneeId || '' })}
                          className="w-full"
                          size="md"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Deadline</label>
                        <input
                          required
                          type="date"
                          value={editTask.deadline}
                          onChange={(e) => setEditTask({ ...editTask, deadline: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Description</label>
                      <textarea
                        value={editTask.description}
                        onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">Save</Button>
                      <Button type="button" variant="secondary" onClick={handleCancelEdit} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Card>
              );
            }
            
            return (
              <Card key={task.id} hover className="p-5 flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <StatusBadge status={task.status} />
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                      <Folder size={12} />
                      {task.project?.name}
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">{task.title}</h4>
                  {task.description && <p className="text-sm text-gray-500 mb-4 line-clamp-2">{task.description}</p>}
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
                  <AssigneeDisplay users={users} assigneeId={task.assigneeId} />
                  <DeadlineDisplay deadline={task.deadline} status={task.status} size={14} />
                </div>
                
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(task)}
                    className="flex-1 flex items-center justify-center gap-1 text-emerald-600 hover:text-emerald-700"
                  >
                    <Edit2 size={14} />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(task.id)}
                    className="flex-1 flex items-center justify-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <ConfirmDialog
        isOpen={isOpen}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        variant={options.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}
