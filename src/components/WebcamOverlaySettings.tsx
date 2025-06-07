
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WebcamOverlaySettingsProps {
  showOverlay: boolean;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size: 'small' | 'medium' | 'large';
  shape: 'circle' | 'rounded';
  onToggleOverlay: (show: boolean) => void;
  onPositionChange: (position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => void;
  onSizeChange: (size: 'small' | 'medium' | 'large') => void;
  onShapeChange: (shape: 'circle' | 'rounded') => void;
  disabled?: boolean;
}

export const WebcamOverlaySettings: React.FC<WebcamOverlaySettingsProps> = ({
  showOverlay,
  position,
  size,
  shape,
  onToggleOverlay,
  onPositionChange,
  onSizeChange,
  onShapeChange,
  disabled = false,
}) => {
  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Webcam Preview Overlay</CardTitle>
        <p className="text-sm text-muted-foreground">Configure webcam display during recording (preview only)</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="show-overlay" className="text-sm font-medium">
            Show Webcam in Preview
          </Label>
          <Switch
            id="show-overlay"
            checked={showOverlay}
            onCheckedChange={onToggleOverlay}
            disabled={disabled}
          />
        </div>

        {showOverlay && (
          <>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Position</Label>
              <Select
                value={position}
                onValueChange={onPositionChange}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top-left">Top Left</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Size</Label>
              <Select
                value={size}
                onValueChange={onSizeChange}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Shape</Label>
              <Select
                value={shape}
                onValueChange={onShapeChange}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="circle">Circle</SelectItem>
                  <SelectItem value="rounded">Rounded Rectangle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
