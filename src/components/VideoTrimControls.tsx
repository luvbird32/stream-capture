
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Scissors } from 'lucide-react';

interface VideoTrimControlsProps {
  trimStart: number;
  trimEnd: number;
  duration: number;
  onTrimStartChange: (value: number[]) => void;
  onTrimEndChange: (value: number[]) => void;
}

export const VideoTrimControls: React.FC<VideoTrimControlsProps> = ({
  trimStart,
  trimEnd,
  duration,
  onTrimStartChange,
  onTrimEndChange,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-primary" />
          <label className="text-sm font-medium text-foreground">Start Time</label>
        </div>
        <Slider
          value={[trimStart]}
          onValueChange={onTrimStartChange}
          max={duration}
          step={0.1}
          className="w-full"
        />
        <div className="text-xs font-mono text-muted-foreground bg-background/50 px-2 py-1 rounded border w-fit">
          {formatTime(trimStart)}
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-primary" />
          <label className="text-sm font-medium text-foreground">End Time</label>
        </div>
        <Slider
          value={[trimEnd]}
          onValueChange={onTrimEndChange}
          max={duration}
          step={0.1}
          className="w-full"
        />
        <div className="text-xs font-mono text-muted-foreground bg-background/50 px-2 py-1 rounded border w-fit">
          {formatTime(trimEnd)}
        </div>
      </div>
    </div>
  );
};
