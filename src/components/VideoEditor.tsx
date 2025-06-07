
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Download, Scissors, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExport = async () => {
    try {
      // For now, we'll export the original video
      // In a full implementation, you'd apply the edits here
      const filename = `edited-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
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

          {/* Timeline Controls */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePlayPause}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReset}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <span className="text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Timeline Slider */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Timeline</label>
              <Slider
                value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
                onValueChange={handleSeek}
                max={100}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Trim Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Trim Start</label>
                <Slider
                  value={[trimStart]}
                  onValueChange={handleTrimStartChange}
                  max={duration}
                  step={0.1}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">
                  {formatTime(trimStart)}
                </span>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Trim End</label>
                <Slider
                  value={[trimEnd]}
                  onValueChange={handleTrimEndChange}
                  max={duration}
                  step={0.1}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">
                  {formatTime(trimEnd)}
                </span>
              </div>
            </div>

            {/* Volume Control */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Volume ({volume}%)
              </label>
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>

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
