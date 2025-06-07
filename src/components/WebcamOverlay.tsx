
import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff } from 'lucide-react';

interface WebcamOverlayProps {
  webcamStream: MediaStream | null;
  isVisible: boolean;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size: 'small' | 'medium' | 'large';
  shape: 'circle' | 'rounded';
  onToggleVisibility: () => void;
}

export const WebcamOverlay: React.FC<WebcamOverlayProps> = ({
  webcamStream,
  isVisible,
  position,
  size,
  shape,
  onToggleVisibility,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (videoRef.current && webcamStream) {
      videoRef.current.srcObject = webcamStream;
    }
  }, [webcamStream]);

  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 'w-24 h-18';
      case 'medium': return 'w-32 h-24';
      case 'large': return 'w-40 h-30';
      default: return 'w-32 h-24';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left': return 'top-4 left-4';
      case 'top-right': return 'top-4 right-4';
      case 'bottom-left': return 'bottom-4 left-4';
      case 'bottom-right': return 'bottom-4 right-4';
      default: return 'bottom-4 right-4';
    }
  };

  const getShapeClasses = () => {
    return shape === 'circle' ? 'rounded-full' : 'rounded-lg';
  };

  if (!isVisible) {
    return (
      <div className={`absolute ${getPositionClasses()} z-20`}>
        <Button
          onClick={onToggleVisibility}
          size="sm"
          variant="outline"
          className="bg-background/80 backdrop-blur-sm"
        >
          <Camera className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`absolute ${getPositionClasses()} z-20 ${getSizeClasses()}`}
      style={isDragging ? { transform: `translate(${dragPosition.x}px, ${dragPosition.y}px)` } : {}}
    >
      <Card className={`${getShapeClasses()} overflow-hidden bg-card/95 backdrop-blur-sm border-2 border-primary/20 relative group`}>
        {webcamStream ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover ${getShapeClasses()}`}
          />
        ) : (
          <div className={`w-full h-full bg-muted flex items-center justify-center ${getShapeClasses()}`}>
            <CameraOff className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
        
        {/* Controls overlay */}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            onClick={onToggleVisibility}
            size="sm"
            variant="ghost"
            className="w-6 h-6 p-0 bg-background/80 hover:bg-background/90"
          >
            <CameraOff className="w-3 h-3" />
          </Button>
        </div>

        {/* Live indicator */}
        {webcamStream && (
          <div className="absolute bottom-1 left-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </div>
        )}
      </Card>
    </div>
  );
};
