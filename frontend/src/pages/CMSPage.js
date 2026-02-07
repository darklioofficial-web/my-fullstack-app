import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CMSPage() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, [pageId]);

  const fetchPage = async () => {
    try {
      const response = await axios.get(`${API}/cms/${pageId}`);
      setPage(response.data);
    } catch (error) {
      console.error('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Page not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-6"
          data-testid="back-button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-6">{page.title}</h1>
          <div className="prose prose-slate max-w-none">
            <div dangerouslySetInnerHTML={{ __html: page.content.replace(/\n/g, '<br />') }} />
          </div>
        </div>
      </div>
    </div>
  );
}
