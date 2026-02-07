import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Eye } from 'lucide-react';

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [proofImage, setProofImage] = useState('');
  const [editTask, setEditTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Instagram Follow', reward: '', link: '', requires_proof: true, active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, subsRes] = await Promise.all([api.admin.getTasks(), api.admin.getSubmissions()]);
      setTasks(tasksRes.data);
      setSubmissions(subsRes.data);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editTask) {
        await api.admin.updateTask(editTask.id, formData);
        toast.success('Task updated');
      } else {
        await api.admin.createTask(formData);
        toast.success('Task created');
      }
      setShowDialog(false);
      setEditTask(null);
      setFormData({ title: '', description: '', category: 'Instagram Follow', reward: '', link: '', requires_proof: true, active: true });
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this task?')) {
      try {
        await api.admin.deleteTask(id);
        toast.success('Task deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.admin.approveSubmission(id);
      toast.success('Submission approved');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Rejection reason:');
    if (reason) {
      try {
        await api.admin.rejectSubmission(id, reason);
        toast.success('Submission rejected');
        fetchData();
      } catch (error) {
        toast.error('Failed to reject');
      }
    }
  };

  const handleViewProof = async (id) => {
    try {
      const response = await api.admin.getSubmissionProof(id);
      setProofImage(response.data.screenshot);
      setShowProofDialog(true);
    } catch (error) {
      toast.error('Failed to load proof');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div data-testid="admin-tasks">
      <div className="mb-8 flex justify-between">
        <div><h1 className="text-3xl font-heading font-bold">Tasks Management</h1></div>
        <Button onClick={() => { setShowDialog(true); setEditTask(null); }} data-testid="create-task-btn">Create Task</Button>
      </div>

      <div className="bg-card rounded-xl border shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">All Tasks</h2>
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr><th className="px-4 py-3 text-left text-sm">Title</th><th className="px-4 py-3 text-left text-sm">Category</th><th className="px-4 py-3 text-left text-sm">Reward</th><th className="px-4 py-3 text-left text-sm">Active</th><th className="px-4 py-3 text-left text-sm">Actions</th></tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-t" data-testid={`task-${task.id}`}>
                <td className="px-4 py-3 text-sm">{task.title}</td>
                <td className="px-4 py-3 text-sm">{task.category}</td>
                <td className="px-4 py-3 text-sm font-semibold">₹{task.reward}</td>
                <td className="px-4 py-3 text-sm">{task.active ? '✓' : '✗'}</td>
                <td className="px-4 py-3 flex gap-2">
                  <Button size="sm" onClick={() => { setEditTask(task); setFormData(task); setShowDialog(true); }}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(task.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-card rounded-xl border shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">Task Submissions</h2>
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-secondary/50 p-4 rounded-lg" data-testid={`submission-${sub.id}`}>
              <div className="flex justify-between items-start">
                <div><p className="font-semibold">{sub.task_title}</p><p className="text-sm text-muted-foreground">{sub.user_name} - {sub.user_email}</p><p className="text-sm">Reward: ₹{sub.reward}</p></div>
                <span className={`px-2 py-1 rounded-full text-xs ${sub.status === 'Submitted' ? 'bg-yellow-100 text-yellow-700' : sub.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{sub.status}</span>
              </div>
              {sub.status === 'Submitted' && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => handleViewProof(sub.id)} variant="outline">
                    <Eye className="w-4 h-4 mr-1" />
                    View Proof
                  </Button>
                  <Button size="sm" onClick={() => handleApprove(sub.id)}>Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleReject(sub.id)}>Reject</Button>
                </div>
              )}
              {(sub.status === 'Approved' || sub.status === 'Rejected') && (
                <div className="mt-3">
                  <Button size="sm" onClick={() => handleViewProof(sub.id)} variant="outline">
                    <Eye className="w-4 h-4 mr-1" />
                    View Proof
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md" data-testid="task-dialog">
          <DialogHeader><DialogTitle>{editTask ? 'Edit Task' : 'Create Task'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
            <Input placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
            <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Instagram Follow">Instagram Follow</SelectItem>
                <SelectItem value="Instagram Like">Instagram Like</SelectItem>
                <SelectItem value="YouTube Subscribe">YouTube Subscribe</SelectItem>
                <SelectItem value="YouTube Like">YouTube Like</SelectItem>
                <SelectItem value="Facebook Follow">Facebook Follow</SelectItem>
                <SelectItem value="Telegram Join">Telegram Join</SelectItem>
              </SelectContent>
            </Select>
            <Input type="number" placeholder="Reward" value={formData.reward} onChange={(e) => setFormData({...formData, reward: e.target.value})} required />
            <Input placeholder="Link" value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} required />
            <Button type="submit" className="w-full">{editTask ? 'Update' : 'Create'}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
        <DialogContent className="max-w-2xl" data-testid="proof-dialog">
          <DialogHeader>
            <DialogTitle>Task Proof Screenshot</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img src={`data:image/png;base64,${proofImage}`} alt="Proof" className="max-w-full max-h-[600px] rounded-lg" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
