
import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, Move } from 'lucide-react';

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
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [customPosition, setCustomPosition] = useState<{ x: number; y: number } | null>(null);

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
    if (customPosition) return '';
    
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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (overlayRef.current) {
      const rect = overlayRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Constrain to viewport
      const maxX = window.innerWidth - (overlayRef.current?.offsetWidth || 0);
      const maxY = window.innerHeight - (overlayRef.current?.offsetHeight || 0);
      
      setCustomPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

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

  const style = customPosition 
    ? { 
        position: 'fixed' as const,
        left: `${customPosition.x}px`,
        top: `${customPosition.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }
    : { cursor: 'grab' };

  return (
    <div
      ref={overlayRef}
      className={`absolute ${customPosition ? '' : getPositionClasses()} z-20 ${getSizeClasses()}`}
      style={style}
      onMouseDown={handleMouseDown}
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
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
            size="sm"
            variant="ghost"
            className="w-6 h-6 p-0 bg-background/80 hover:bg-background/90"
          >
            <CameraOff className="w-3 h-3" />
          </Button>
        </div>

        {/* Drag indicator */}
        <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Move className="w-3 h-3 text-white/70" />
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
