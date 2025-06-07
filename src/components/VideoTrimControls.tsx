
import React from 'react';
import { Slider } from '@/components/ui/slider';

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
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Trim Start</label>
        <Slider
          value={[trimStart]}
          onValueChange={onTrimStartChange}
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
          onValueChange={onTrimEndChange}
          max={duration}
          step={0.1}
          className="w-full"
        />
        <span className="text-xs text-muted-foreground">
          {formatTime(trimEnd)}
        </span>
      </div>
    </div>
  );
};
