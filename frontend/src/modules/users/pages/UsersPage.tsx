import { useEffect, useState } from 'react';
import { usersApi } from '../../../api/client';
import { User } from '../../../api/types';
import { Plus, Trash2, Mail, User as UserIcon, Edit2 } from 'lucide-react';
import { useConfirm } from '../../../shared/hooks/useConfirm';
import { LoadingSpinner } from '../../../shared/components/ui/LoadingSpinner';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { ConfirmDialog } from '../../../shared/components/ui/ConfirmDialog';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '' });
  const [editUser, setEditUser] = useState({ name: '', email: '' });
  const { confirmDelete, isOpen, options, handleConfirm, handleCancel } = useConfirm();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    usersApi.findAll().then((res) => {
      setUsers(res.data);
      setLoading(false);
    });
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim()) return;
    try {
      await usersApi.create(newUser);
      setNewUser({ name: '', email: '' });
      setIsAdding(false);
      loadUsers();
    } catch (error) {
      alert('Error creating user. Email might already exist.');
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setEditUser({ name: user.name, email: user.email });
  };

  const handleUpdate = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser.name.trim() || !editUser.email.trim()) return;
    try {
      await usersApi.update(id, editUser);
      setEditingId(null);
      loadUsers();
    } catch (error) {
      alert('Error updating user. Email might already exist.');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditUser({ name: '', email: '' });
  };

  const handleDelete = async (id: string) => {
    const user = users.find((u) => u.id === id);
    const taskCount = user?._count?.tasks || 0;

    let message = 'Delete this user?';
    let variant: 'danger' | 'warning' = 'danger';

    if (taskCount > 0) {
      message = `This user has ${taskCount} assigned task${taskCount > 1 ? 's' : ''}. Deleting will unassign all tasks. Are you sure you want to delete this user?`;
      variant = 'warning';
    }

    const confirmed = await confirmDelete(message);
    if (confirmed) {
      try {
        await usersApi.remove(id);
        loadUsers();
      } catch (error: any) {
        alert(error?.response?.data?.message || 'Error deleting user. They may have assigned tasks.');
      }
    }
  };

  if (loading) return <LoadingSpinner message="Loading users..." />;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="page-title">Users</h2>
            <p className="page-subtitle">Manage team members and task assignees.</p>
          </div>
          <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
            <Plus size={18} />
            Add User
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="p-6 border-emerald-200">
          <form onSubmit={handleAddUser} className="flex flex-wrap gap-4">
            <input
              required
              autoFocus
              type="text"
              placeholder="Full Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
            <input
              required
              type="email"
              placeholder="Email Address"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
            <Button type="submit">Create</Button>
            <Button type="button" variant="secondary" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id} hover className="p-6">
            {editingId === user.id ? (
              <form onSubmit={(e) => handleUpdate(user.id, e)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Name</label>
                  <input
                    required
                    type="text"
                    value={editUser.name}
                    onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Email</label>
                  <input
                    required
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Save</Button>
                  <Button type="button" variant="secondary" onClick={handleCancelEdit} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xl">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
                      <Mail size={14} />
                      {user.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mt-2">
                      <UserIcon size={12} />
                      {user._count?.tasks || 0} tasks assigned
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-gray-400 hover:text-emerald-600 transition-colors p-1.5 rounded hover:bg-emerald-50"
                    title="Edit user"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded hover:bg-red-50"
                    title="Delete user"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}
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
