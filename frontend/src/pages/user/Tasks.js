import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { ExternalLink, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, submissionsRes] = await Promise.all([
        api.getTasks(),
        api.getMySubmissions()
      ]);
      setTasks(tasksRes.data);
      setSubmissions(submissionsRes.data);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!screenshot) {
      toast.error('Please upload a screenshot');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('screenshot', screenshot);
      
      await api.submitTask(selectedTask.id, formData);
      toast.success('Task submitted successfully!');
      setSelectedTask(null);
      setScreenshot(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit task');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Submitted': { icon: Clock, color: 'text-yellow-600 bg-yellow-50', label: 'Pending' },
      'Under Review': { icon: Clock, color: 'text-blue-600 bg-blue-50', label: 'Reviewing' },
      'Approved': { icon: CheckCircle, color: 'text-green-600 bg-green-50', label: 'Approved' },
      'Rejected': { icon: XCircle, color: 'text-red-600 bg-red-50', label: 'Rejected' }
    };
    const badge = badges[status] || badges['Submitted'];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <badge.icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 pt-20" data-testid="tasks-page">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Available Tasks</h1>
          <p className="text-muted-foreground">Complete tasks and earn rewards</p>
        </div>
        <Button onClick={() => setShowSubmissions(true)} variant="outline" data-testid="view-submissions-button">
          My Submissions
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <div
            key={task.id}
            data-testid={`task-card-${task.id}`}
            className="bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {task.category}
                  </span>
                </div>
                {task.completed && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>
              
              <h3 className="text-lg font-heading font-bold text-foreground mb-2">{task.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{task.description}</p>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Reward</p>
                  <p className="text-2xl font-heading font-bold text-amber-500">₹{task.reward}</p>
                </div>
                
                {task.completed ? (
                  <Button disabled className="rounded-full" data-testid={`task-completed-${task.id}`}>
                    Completed
                  </Button>
                ) : (
                  <Button
                    onClick={() => setSelectedTask(task)}
                    className="bg-primary hover:bg-primary/90 rounded-full"
                    data-testid={`task-start-${task.id}`}
                  >
                    Start Task
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-md" data-testid="task-submission-dialog">
            <DialogHeader>
              <DialogTitle>{selectedTask.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">{selectedTask.description}</p>
                <a
                  href={selectedTask.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                  data-testid="task-link"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Link
                </a>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Upload Proof Screenshot
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setScreenshot(e.target.files[0])}
                    className="hidden"
                    id="screenshot-upload"
                    data-testid="screenshot-upload"
                  />
                  <label htmlFor="screenshot-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {screenshot ? screenshot.name : 'Click to upload screenshot'}
                    </p>
                  </label>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting || !screenshot}
                className="w-full bg-primary hover:bg-primary/90 rounded-full"
                data-testid="submit-task-button"
              >
                {submitting ? 'Submitting...' : 'Submit Task'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showSubmissions && (
        <Dialog open={showSubmissions} onOpenChange={setShowSubmissions}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="submissions-dialog">
            <DialogHeader>
              <DialogTitle>My Submissions</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {submissions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No submissions yet</p>
              ) : (
                submissions.map((submission) => (
                  <div key={submission.id} className="bg-secondary/50 rounded-lg p-4" data-testid={`submission-${submission.id}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-foreground">{submission.task_title}</h4>
                      {getStatusBadge(submission.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Reward: ₹{submission.reward}</p>
                    {submission.rejection_reason && (
                      <p className="text-sm text-red-600 mt-2">Reason: {submission.rejection_reason}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}