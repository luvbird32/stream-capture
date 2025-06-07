
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Share, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Recording {
  id: string;
  name: string;
  duration: number;
  size: number;
  createdAt: Date;
  blob: Blob;
  thumbnail?: string;
}

interface RecordingManagerProps {
  recordings: Recording[];
  onShare: (recording: Recording) => void;
  onDelete: (id: string) => void;
}

export const RecordingManager: React.FC<RecordingManagerProps> = ({
  recordings,
  onShare,
  onDelete,
}) => {
  const { toast } = useToast();

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const downloadRecording = (recording: Recording) => {
    const url = URL.createObjectURL(recording.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recording.name}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: `${recording.name} is being downloaded.`,
    });
  };

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Your Recordings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recordings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-4">📁</div>
            <p>No recordings yet</p>
            <p className="text-sm">Your recordings will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recordings.map((recording) => (
              <div
                key={recording.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{recording.name}</h4>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {formatDuration(recording.duration)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {formatFileSize(recording.size)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {recording.createdAt.toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadRecording(recording)}
                  >
                    Download
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onShare(recording)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Share className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
