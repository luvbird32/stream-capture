
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX } from 'lucide-react';

interface VideoVolumeControlProps {
  volume: number;
  onVolumeChange: (value: number[]) => void;
}

export const VideoVolumeControl: React.FC<VideoVolumeControlProps> = ({
  volume,
  onVolumeChange,
}) => {
  const VolumeIcon = volume === 0 ? VolumeX : Volume2;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <VolumeIcon className="w-4 h-4 text-primary" />
          <label className="text-sm font-medium text-foreground">Volume</label>
        </div>
        <div className="text-xs font-mono text-muted-foreground bg-background/50 px-2 py-1 rounded border">
          {volume}%
        </div>
      </div>
      <Slider
        value={[volume]}
        onValueChange={onVolumeChange}
        max={100}
        step={1}
        className="w-full"
      />
    </div>
  );
};
