
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Share, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LiveStreamPanelProps {
  isStreaming: boolean;
  onStartStream: (streamKey: string, platform: string) => void;
  onStopStream: () => void;
  viewerCount?: number;
}

export const LiveStreamPanel: React.FC<LiveStreamPanelProps> = ({
  isStreaming,
  onStartStream,
  onStopStream,
  viewerCount = 0,
}) => {
  const [streamKey, setStreamKey] = useState('');
  const [platform, setPlatform] = useState('custom');
  const { toast } = useToast();

  const handleStartStream = () => {
    if (!streamKey.trim()) {
      toast({
        title: "Stream Key Required",
        description: "Please enter a valid stream key.",
        variant: "destructive",
      });
      return;
    }
    
    onStartStream(streamKey, platform);
    toast({
      title: "Live Stream Started",
      description: "Your screen is now being streamed live.",
    });
  };

  const generateShareableLink = () => {
    const link = `https://your-app.com/watch/${Date.now()}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Shareable link copied to clipboard.",
    });
  };

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Share className="w-5 h-5" />
          Live Streaming
          {isStreaming && (
            <Badge variant="destructive" className="ml-auto">
              LIVE
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isStreaming ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="stream-key">Stream Key</Label>
              <Input
                id="stream-key"
                type="password"
                placeholder="Enter your RTMP stream key"
                value={streamKey}
                onChange={(e) => setStreamKey(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handleStartStream} 
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              <Camera className="w-4 h-4 mr-2" />
              Go Live
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="font-medium text-red-700 dark:text-red-300">
                  Live Stream Active
                </span>
              </div>
              <Badge variant="outline" className="text-red-700 dark:text-red-300">
                {viewerCount} viewers
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={generateShareableLink}
                variant="outline"
                className="flex-1"
              >
                Copy Link
              </Button>
              <Button
                onClick={onStopStream}
                variant="destructive"
                className="flex-1"
              >
                Stop Stream
              </Button>
            </div>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          <p>• Supports RTMP streaming to any platform</p>
          <p>• Generate shareable links for instant viewing</p>
          <p>• Real-time viewer analytics</p>
        </div>
      </CardContent>
    </Card>
  );
};
