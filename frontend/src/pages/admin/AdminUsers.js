import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Eye, Edit } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editData, setEditData] = useState({ full_name: '', date_of_birth: '', gender: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.admin.getUsers();
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (userId) => {
    try {
      await api.admin.blockUser(userId);
      toast.success('User status updated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleView = async (userId) => {
    try {
      const response = await api.admin.getUserDetails(userId);
      setSelectedUser(response.data);
      setShowViewDialog(true);
    } catch (error) {
      toast.error('Failed to load user details');
    }
  };

  const handleEdit = async (userId) => {
    try {
      const response = await api.admin.getUserDetails(userId);
      setSelectedUser(response.data);
      setEditData({
        full_name: response.data.full_name || '',
        date_of_birth: response.data.date_of_birth || '',
        gender: response.data.gender || ''
      });
      setShowEditDialog(true);
    } catch (error) {
      toast.error('Failed to load user details');
    }
  };

  const handleUpdateUser = async () => {
    try {
      await api.admin.updateUser(selectedUser.id, editData);
      toast.success('User updated successfully');
      setShowEditDialog(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div data-testid="admin-users">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Users Management</h1>
        <p className="text-muted-foreground">Manage all registered users</p>
      </div>

      <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Mobile</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Balance</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">KYC</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-border" data-testid={`user-row-${user.id}`}>
                  <td className="px-4 py-3 text-sm">{user.full_name}</td>
                  <td className="px-4 py-3 text-sm">{user.email}</td>
                  <td className="px-4 py-3 text-sm">{user.mobile}</td>
                  <td className="px-4 py-3 text-sm font-semibold">₹{user.wallet_balance?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm">{user.kyc_status}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.is_blocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {user.is_blocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleView(user.id)}
                        variant="outline"
                        size="sm"
                        data-testid={`view-user-${user.id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        onClick={() => handleEdit(user.id)}
                        variant="outline"
                        size="sm"
                        data-testid={`edit-user-${user.id}`}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleBlock(user.id)}
                        variant={user.is_blocked ? 'outline' : 'destructive'}
                        size="sm"
                        data-testid={`block-user-${user.id}`}
                      >
                        {user.is_blocked ? 'Unblock' : 'Block'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl" data-testid="view-user-dialog">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-semibold">{selectedUser.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mobile</p>
                  <p className="font-semibold">{selectedUser.mobile}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-semibold">{selectedUser.gender || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-semibold">{selectedUser.date_of_birth || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wallet Balance</p>
                  <p className="font-semibold text-green-600">₹{selectedUser.wallet_balance?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <p className="font-semibold">₹{selectedUser.total_earned?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Referral Earnings</p>
                  <p className="font-semibold">₹{selectedUser.referral_earnings?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">KYC Status</p>
                  <p className="font-semibold">{selectedUser.kyc_status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Referral Code</p>
                  <p className="font-semibold">{selectedUser.referral_code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Status</p>
                  <p className={`font-semibold ${selectedUser.is_blocked ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedUser.is_blocked ? 'Blocked' : 'Active'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-semibold">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md" data-testid="edit-user-dialog">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <Input
                value={editData.full_name}
                onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                data-testid="edit-full-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date of Birth</label>
              <Input
                type="date"
                value={editData.date_of_birth}
                onChange={(e) => setEditData({ ...editData, date_of_birth: e.target.value })}
                data-testid="edit-dob"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Gender</label>
              <Input
                value={editData.gender}
                onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                placeholder="Male/Female/Other"
                data-testid="edit-gender"
              />
            </div>
            <Button onClick={handleUpdateUser} className="w-full" data-testid="save-user-button">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
