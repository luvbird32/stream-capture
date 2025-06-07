
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Stop, Camera, Mic } from 'lucide-react';

interface RecordingControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  isPaused,
  duration,
  onStart,
  onPause,
  onResume,
  onStop,
  disabled = false,
}) => {
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6 bg-card/95 backdrop-blur-sm border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {!isRecording ? (
            <Button
              onClick={onStart}
              disabled={disabled}
              size="lg"
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8"
            >
              <Camera className="w-5 h-5 mr-2" />
              Start Recording
            </Button>
          ) : (
            <div className="flex gap-3">
              {isPaused ? (
                <Button
                  onClick={onResume}
                  size="lg"
                  variant="outline"
                  className="border-green-500 text-green-500 hover:bg-green-50"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Resume
                </Button>
              ) : (
                <Button
                  onClick={onPause}
                  size="lg"
                  variant="outline"
                  className="border-yellow-500 text-yellow-500 hover:bg-yellow-50"
                >
                  <Stop className="w-5 h-5 mr-2" />
                  Pause
                </Button>
              )}
              <Button
                onClick={onStop}
                size="lg"
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50"
              >
                <Stop className="w-5 h-5 mr-2" />
                Stop
              </Button>
            </div>
          )}
        </div>

        {isRecording && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
              <span className="font-mono text-lg font-medium">
                {formatDuration(duration)}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
