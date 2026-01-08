import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi } from '../../../api/client';
import { Project } from '../../../api/types';
import { Plus, Folder, ChevronRight, Trash2 } from 'lucide-react';
import { useConfirm } from '../../../shared/hooks/useConfirm';
import { LoadingSpinner } from '../../../shared/components/ui/LoadingSpinner';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { ConfirmDialog } from '../../../shared/components/ui/ConfirmDialog';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const { confirmDelete, isOpen, options, handleConfirm, handleCancel } = useConfirm();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    projectsApi.findAll().then((res) => {
      setProjects(res.data);
      setLoading(false);
    });
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await projectsApi.create({ name: newName });
    setNewName('');
    setIsAdding(false);
    loadProjects();
  };

  const handleDelete = async (id: string) => {
    const project = projects.find((p) => p.id === id);
    const taskCount = project?._count?.tasks || 0;

    let message = 'Are you sure you want to delete this project?';
    if (taskCount > 0) {
      message = `This project has ${taskCount} task${taskCount > 1 ? 's' : ''}. Deleting will permanently remove the project and all its tasks. Are you sure?`;
    }

    const confirmed = await confirmDelete(message);
    if (confirmed) {
      try {
        await projectsApi.remove(id);
        loadProjects();
      } catch (error: any) {
        alert(error?.response?.data?.message || 'Error deleting project.');
      }
    }
  };

  if (loading) return <LoadingSpinner message="Loading projects..." />;

  return (
    <div className="space-y-8">
      <div className="page-header">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="page-title">Projects</h2>
            <p className="page-subtitle">Manage your project portfolios.</p>
          </div>
          <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
            <Plus size={18} />
            New Project
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="p-6 border-emerald-200">
          <form onSubmit={handleAddProject} className="flex gap-4">
            <input
              autoFocus
              type="text"
              placeholder="Project Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
            <Button type="submit">Create</Button>
            <Button type="button" variant="secondary" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} hover className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <Folder size={24} />
              </div>
              <button
                onClick={() => handleDelete(project.id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                title="Delete project"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
            <p className="text-sm text-gray-600 mb-6 min-h-[2.5rem]">
              {project.description || 'No description provided.'}
            </p>
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <span className="text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg">
                {project._count?.tasks || 0} tasks
              </span>
              <Link
                to={`/projects/${project.id}`}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors"
              >
                View Tasks
                <ChevronRight size={16} />
              </Link>
            </div>
          </Card>
        ))}
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
