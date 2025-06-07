
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface VideoPlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onReset: () => void;
  onSeek: (value: number[]) => void;
}

export const VideoPlayerControls: React.FC<VideoPlayerControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onReset,
  onSeek,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          onClick={onPlayPause}
          className="gap-2"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onReset}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
        <div className="text-sm font-mono text-muted-foreground bg-background/50 px-2 py-1 rounded border">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Timeline</label>
        <Slider
          value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
          onValueChange={onSeek}
          max={100}
          step={0.1}
          className="w-full"
        />
      </div>
    </div>
  );
};
