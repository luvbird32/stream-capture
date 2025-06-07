import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RecordingOptions } from '../services/RecordingService';
import { WebcamOverlaySettings } from './WebcamOverlaySettings';

interface RecordingSettingsProps {
  options: RecordingOptions;
  onChange: (options: RecordingOptions) => void;
  disabled?: boolean;
  showWebcamOverlay: boolean;
  webcamOverlayPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  webcamOverlaySize: 'small' | 'medium' | 'large';
  webcamOverlayShape: 'circle' | 'rounded';
  onToggleWebcamOverlay: (show: boolean) => void;
  onWebcamOverlayPositionChange: (position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => void;
  onWebcamOverlaySizeChange: (size: 'small' | 'medium' | 'large') => void;
  onWebcamOverlayShapeChange: (shape: 'circle' | 'rounded') => void;
}

export const RecordingSettings: React.FC<RecordingSettingsProps> = ({
  options,
  onChange,
  disabled = false,
  showWebcamOverlay,
  webcamOverlayPosition,
  webcamOverlaySize,
  webcamOverlayShape,
  onToggleWebcamOverlay,
  onWebcamOverlayPositionChange,
  onWebcamOverlaySizeChange,
  onWebcamOverlayShapeChange,
}) => {
  const updateOption = <K extends keyof RecordingOptions>(
    key: K,
    value: RecordingOptions[K]
  ) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/95 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recording Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="include-audio" className="text-sm font-medium">
              Include System Audio
            </Label>
            <Switch
              id="include-audio"
              checked={options.includeAudio}
              onCheckedChange={(checked) => updateOption('includeAudio', checked)}
              disabled={disabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="include-microphone" className="text-sm font-medium">
              Include Microphone
            </Label>
            <Switch
              id="include-microphone"
              checked={options.includeMicrophone}
              onCheckedChange={(checked) => updateOption('includeMicrophone', checked)}
              disabled={disabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="include-webcam" className="text-sm font-medium">
              Include Webcam (Preview Only)
            </Label>
            <Switch
              id="include-webcam"
              checked={options.includeWebcam}
              onCheckedChange={(checked) => updateOption('includeWebcam', checked)}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Video Quality</Label>
            <Select
              value={options.quality}
              onValueChange={(value: 'low' | 'medium' | 'high') => updateOption('quality', value)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (720p)</SelectItem>
                <SelectItem value="medium">Medium (1080p)</SelectItem>
                <SelectItem value="high">High (1440p)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Frame Rate</Label>
            <Select
              value={options.frameRate.toString()}
              onValueChange={(value) => updateOption('frameRate', parseInt(value))}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">24 FPS</SelectItem>
                <SelectItem value="30">30 FPS</SelectItem>
                <SelectItem value="60">60 FPS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {options.includeWebcam && (
        <WebcamOverlaySettings
          showOverlay={showWebcamOverlay}
          position={webcamOverlayPosition}
          size={webcamOverlaySize}
          shape={webcamOverlayShape}
          onToggleOverlay={onToggleWebcamOverlay}
          onPositionChange={onWebcamOverlayPositionChange}
          onSizeChange={onWebcamOverlaySizeChange}
          onShapeChange={onWebcamOverlayShapeChange}
          disabled={disabled}
        />
      )}
    </div>
  );
};
