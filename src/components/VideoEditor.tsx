
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scissors, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VideoPlayerControls } from './VideoPlayerControls';
import { VideoTrimControls } from './VideoTrimControls';
import { VideoVolumeControl } from './VideoVolumeControl';

interface VideoEditorProps {
  videoBlob: Blob;
  onExport: (editedBlob: Blob, filename: string) => void;
  onClose: () => void;
}

export const VideoEditor: React.FC<VideoEditorProps> = ({
  videoBlob,
  onExport,
  onClose,
}) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [volume, setVolume] = useState(100);

  useEffect(() => {
    if (videoRef.current && videoBlob) {
      const url = URL.createObjectURL(videoBlob);
      videoRef.current.src = url;
      
      return () => URL.revokeObjectURL(url);
    }
  }, [videoBlob]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setTrimEnd(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      const newTime = (value[0] / 100) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleReset = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
      videoRef.current.pause();
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
    }
  };

  const handleTrimStartChange = (value: number[]) => {
    setTrimStart(Math.min(value[0], trimEnd - 1));
  };

  const handleTrimEndChange = (value: number[]) => {
    setTrimEnd(Math.max(value[0], trimStart + 1));
  };

  const handleExport = async () => {
    try {
      // Determine file extension based on blob type
      const fileExtension = videoBlob.type.includes('mp4') ? 'mp4' : 'webm';
      const filename = `edited-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${fileExtension}`;
      onExport(videoBlob, filename);
      
      toast({
        title: "Export Complete",
        description: "Your edited video is ready for download.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export the video.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/95 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Scissors className="w-5 h-5" />
              Video Editor
            </span>
            <Button variant="outline" onClick={onClose}>
              Close Editor
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Video Preview */}
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>

          {/* Player Controls */}
          <VideoPlayerControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onPlayPause={handlePlayPause}
            onReset={handleReset}
            onSeek={handleSeek}
          />

          {/* Trim Controls */}
          <VideoTrimControls
            trimStart={trimStart}
            trimEnd={trimEnd}
            duration={duration}
            onTrimStartChange={handleTrimStartChange}
            onTrimEndChange={handleTrimEndChange}
          />

          {/* Volume Control */}
          <VideoVolumeControl
            volume={volume}
            onVolumeChange={handleVolumeChange}
          />

          {/* Export Controls */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleExport} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Export Video
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
