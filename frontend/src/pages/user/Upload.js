import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Trophy, Upload as UploadIcon, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function Upload() {
  const [formData, setFormData] = useState({ platform: '', video_link: '' });
  const [screenshot, setScreenshot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploads, setUploads] = useState([]);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const response = await api.getMyUploads();
      setUploads(response.data);
    } catch (error) {
      toast.error('Failed to load uploads');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!screenshot) {
      toast.error('Please upload analytics screenshot');
      return;
    }

    setSubmitting(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('data', JSON.stringify(formData));
      formDataObj.append('screenshot', screenshot);
      
      await api.submitUpload(formDataObj);
      toast.success('Upload submitted successfully!');
      setFormData({ platform: '', video_link: '' });
      setScreenshot(null);
      fetchUploads();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit upload');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Submitted': { icon: Clock, color: 'text-yellow-600 bg-yellow-50', label: 'Under Review' },
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

  return (
    <div className="p-4 md:p-8 pt-20" data-testid="upload-page">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Upload & Earn</h1>
        <p className="text-muted-foreground">Create content and earn big rewards</p>
      </div>

      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 mb-8 text-white shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-heading font-bold">Mega Creator Challenge</h2>
            <p className="text-amber-50">Earn ₹1,000 for 10,000 Views!</p>
          </div>
        </div>
        <p className="text-amber-50 mb-4">
          Make a high-quality video review of EarnKaro Student. Share your genuine positive experience
          and show others how to earn!
        </p>
        <div className="bg-white/10 rounded-lg p-4">
          <p className="font-semibold mb-2">✅ Requirements:</p>
          <ul className="space-y-1 text-sm text-amber-50">
            <li>• 10,000+ Organic Views</li>
            <li>• Positive app review</li>
            <li>• Analytics screenshot required</li>
            <li>• No fake or bot views</li>
          </ul>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6 mb-8">
        <h3 className="text-xl font-heading font-bold text-foreground mb-6">Submit Your Video</h3>
        <form onSubmit={handleSubmit} className="space-y-6" data-testid="upload-form">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Platform</label>
            <Select
              value={formData.platform}
              onValueChange={(value) => setFormData({ ...formData, platform: value })}
              data-testid="platform-select"
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="YouTube">YouTube</SelectItem>
                <SelectItem value="Facebook">Facebook</SelectItem>
                <SelectItem value="TikTok">TikTok</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Video Link</label>
            <Input
              data-testid="video-link-input"
              type="url"
              value={formData.video_link}
              onChange={(e) => setFormData({ ...formData, video_link: e.target.value })}
              placeholder="https://..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Analytics Screenshot</label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setScreenshot(e.target.files[0])}
                className="hidden"
                id="analytics-upload"
                data-testid="analytics-upload"
              />
              <label htmlFor="analytics-upload" className="cursor-pointer">
                <UploadIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {screenshot ? screenshot.name : 'Click to upload analytics screenshot'}
                </p>
              </label>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-primary/90 rounded-full h-12 text-base font-semibold"
            data-testid="submit-upload-button"
          >
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </Button>
        </form>
      </div>

      {uploads.length > 0 && (
        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6">
          <h3 className="text-xl font-heading font-bold text-foreground mb-6">Submission History</h3>
          <div className="space-y-4">
            {uploads.map((upload) => (
              <div key={upload.id} className="bg-secondary/50 rounded-lg p-4" data-testid={`upload-${upload.id}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-foreground">{upload.platform}</p>
                    <a href={upload.video_link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                      View Video
                    </a>
                  </div>
                  {getStatusBadge(upload.status)}
                </div>
                {upload.rejection_reason && (
                  <p className="text-sm text-red-600 mt-2">Reason: {upload.rejection_reason}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}