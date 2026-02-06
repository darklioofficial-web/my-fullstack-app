import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { PlayCircle, Clock } from 'lucide-react';

export default function Ads() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watching, setWatching] = useState(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await api.getAds();
      setAds(response.data);
    } catch (error) {
      toast.error('Failed to load ads');
    } finally {
      setLoading(false);
    }
  };

  const handleWatchAd = async (ad) => {
    if (!ad.can_watch) {
      toast.error('Please wait for 24 hours');
      return;
    }

    setWatching(ad.id);
    window.open(ad.link, '_blank');
    
    setTimeout(async () => {
      try {
        const response = await api.watchAd(ad.id);
        toast.success(`Earned ₹${response.data.reward}!`);
        fetchAds();
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Failed to watch ad');
      } finally {
        setWatching(null);
      }
    }, ad.duration * 1000);
  };

  const getTimeRemaining = (nextAvailable) => {
    if (!nextAvailable) return null;
    const now = new Date();
    const next = new Date(nextAvailable);
    const diff = next - now;
    
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 pt-20" data-testid="ads-page">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Watch & Earn</h1>
        <p className="text-muted-foreground">Watch ads and earn rewards</p>
      </div>

      {ads.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No ads available at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => {
            const timeRemaining = getTimeRemaining(ad.next_available);
            
            return (
              <div
                key={ad.id}
                data-testid={`ad-card-${ad.id}`}
                className="bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all p-6"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky-100 to-blue-100 rounded-full mb-4">
                  <PlayCircle className="w-8 h-8 text-primary" />
                </div>
                
                <h3 className="text-lg font-heading font-bold text-foreground mb-2">{ad.title}</h3>
                <p className="text-sm text-muted-foreground mb-1">Duration: {ad.duration}s</p>
                <p className="text-2xl font-heading font-bold text-amber-500 mb-4">₹{ad.reward}</p>
                
                {ad.can_watch ? (
                  <Button
                    onClick={() => handleWatchAd(ad)}
                    disabled={watching === ad.id}
                    className="w-full bg-primary hover:bg-primary/90 rounded-full"
                    data-testid={`watch-ad-${ad.id}`}
                  >
                    {watching === ad.id ? 'Watching...' : 'Watch Now'}
                  </Button>
                ) : (
                  <Button disabled className="w-full rounded-full" data-testid={`ad-locked-${ad.id}`}>
                    <Clock className="w-4 h-4 mr-2" />
                    {timeRemaining || 'Available Soon'}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}