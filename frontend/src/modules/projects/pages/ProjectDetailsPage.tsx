import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsApi, tasksApi, usersApi } from '../../../api/client';
import { Project, Task, User, TaskStatus } from '../../../api/types';
import { ArrowLeft, Plus, Trash2, Edit2 } from 'lucide-react';
import { StatusSelect } from '../../../shared/components/ui/StatusSelect';
import { AssigneeSelect } from '../../../shared/components/ui/AssigneeSelect';
import { AssigneeDisplay } from '../../../shared/components/ui/AssigneeDisplay';
import { DeadlineDisplay } from '../../../shared/components/ui/DeadlineDisplay';
import { StatusBadge } from '../../../shared/components/ui/StatusBadge';
import { useConfirm } from '../../../shared/hooks/useConfirm';
import { LoadingSpinner } from '../../../shared/components/ui/LoadingSpinner';
import { EmptyState } from '../../../shared/components/ui/EmptyState';
import { isOverdue } from '../../../shared/utils/date.utils';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { ConfirmDialog } from '../../../shared/components/ui/ConfirmDialog';

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { confirmDelete, isOpen, options, handleConfirm, handleCancel } = useConfirm();

  const [newTask, setNewTask] = useState({
    title: '',
    deadline: new Date().toISOString().split('T')[0],
    assigneeId: '',
  });

  const [editTask, setEditTask] = useState({
    title: '',
    description: '',
    deadline: '',
    assigneeId: '',
    status: TaskStatus.TODO,
  });

  useEffect(() => {
    if (id) {
      Promise.all([
        projectsApi.findOne(id),
        tasksApi.findAll({ projectId: id }),
        usersApi.findAll(),
      ]).then(([projRes, tasksRes, usersRes]) => {
        setProject(projRes.data);
        setTasks(tasksRes.data);
        setUsers(usersRes.data);
        setLoading(false);
      });
    }
  }, [id]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newTask.title.trim()) return;
    await tasksApi.create({
      ...newTask,
      projectId: id,
    });
    setNewTask({ title: '', deadline: new Date().toISOString().split('T')[0], assigneeId: '' });
    setIsAdding(false);
    const tasksRes = await tasksApi.findAll({ projectId: id });
    setTasks(tasksRes.data);
  };

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
    const tasksRes = await tasksApi.findAll({ projectId: id });
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
        const tasksRes = await tasksApi.findAll({ projectId: id });
        setTasks(tasksRes.data);
      } catch (error: any) {
        alert(error?.response?.data?.message || 'Error deleting task.');
      }
    }
  };

  if (loading) return <LoadingSpinner message="Loading project details..." />;
  if (!project) return <EmptyState message="Project not found." />;

  return (
    <div className="space-y-6">
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors font-medium"
      >
        <ArrowLeft size={16} />
        Back to Projects
      </Link>

      <div className="page-header">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="page-title">{project.name}</h2>
            <p className="page-subtitle mt-1">{project.description}</p>
          </div>
          <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
            <Plus size={18} />
            Add Task
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="p-6 border-emerald-200">
          <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Task Title</label>
            <input
              autoFocus
              required
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Deadline</label>
            <input
              required
              type="date"
              value={newTask.deadline}
              onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Assignee</label>
            <AssigneeSelect
              users={users}
              value={newTask.assigneeId}
              onChange={(assigneeId) => setNewTask({ ...newTask, assigneeId: assigneeId || '' })}
              className="w-full"
            />
          </div>
          <div className="md:col-span-4 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Task</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Assignee</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Deadline</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12">
                  <EmptyState message="No tasks found for this project." />
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const taskIsOverdue = isOverdue(task.deadline, task.status);
                const isEditing = editingId === task.id;
                
                if (isEditing) {
                  return (
                    <tr key={task.id} className="bg-emerald-50">
                      <td colSpan={5} className="px-6 py-4">
                        <form onSubmit={(e) => handleUpdate(task.id, e)} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Status</label>
                            <StatusSelect
                              value={editTask.status}
                              onChange={(status) => setEditTask({ ...editTask, status })}
                              size="md"
                              className="border border-gray-300 w-full"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Title</label>
                            <input
                              required
                              type="text"
                              value={editTask.title}
                              onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                            />
                            <input
                              type="text"
                              placeholder="Description (optional)"
                              value={editTask.description}
                              onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-2 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
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
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                            />
                            <div className="flex gap-2 mt-2">
                              <Button type="submit" size="sm" className="flex-1">
                                Save
                              </Button>
                              <Button type="button" variant="secondary" size="sm" onClick={handleCancelEdit} className="flex-1">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </form>
                      </td>
                    </tr>
                  );
                }
                
                return (
                  <tr key={task.id} className="hover:bg-emerald-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-medium ${task.status === TaskStatus.DONE ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <AssigneeDisplay users={users} assigneeId={task.assigneeId} />
                    </td>
                    <td className="px-6 py-4">
                      <DeadlineDisplay deadline={task.deadline} status={task.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => handleEdit(task)}
                          className="text-gray-400 hover:text-emerald-600 p-1.5 rounded hover:bg-emerald-50 transition-colors"
                          title="Edit task"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors"
                          title="Delete task"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Card>

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
