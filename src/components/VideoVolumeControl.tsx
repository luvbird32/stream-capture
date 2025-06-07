
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Volume2 } from 'lucide-react';

interface VideoVolumeControlProps {
  volume: number;
  onVolumeChange: (value: number[]) => void;
}

export const VideoVolumeControl: React.FC<VideoVolumeControlProps> = ({
  volume,
  onVolumeChange,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-2">
        <Volume2 className="w-4 h-4" />
        Volume ({volume}%)
      </label>
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
