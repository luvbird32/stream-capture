
import React, { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { WebcamOverlay } from './WebcamOverlay';

interface RecordingPreviewProps {
  stream: MediaStream | null;
  webcamStream: MediaStream | null;
  isRecording: boolean;
  recordedBlob: Blob | null;
  showWebcamOverlay: boolean;
  webcamOverlayPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  webcamOverlaySize: 'small' | 'medium' | 'large';
  webcamOverlayShape: 'circle' | 'rounded';
  onToggleWebcamOverlay: () => void;
}

export const RecordingPreview: React.FC<RecordingPreviewProps> = ({
  stream,
  webcamStream,
  isRecording,
  recordedBlob,
  showWebcamOverlay,
  webcamOverlayPosition,
  webcamOverlaySize,
  webcamOverlayShape,
  onToggleWebcamOverlay,
}) => {
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const playbackVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (liveVideoRef.current && stream && isRecording) {
      liveVideoRef.current.srcObject = stream;
    }
  }, [stream, isRecording]);

  useEffect(() => {
    if (playbackVideoRef.current && recordedBlob && !isRecording) {
      const url = URL.createObjectURL(recordedBlob);
      playbackVideoRef.current.src = url;
      
      return () => URL.revokeObjectURL(url);
    }
  }, [recordedBlob, isRecording]);

  return (
    <Card className="p-4 bg-card/95 backdrop-blur-sm border-border/50">
      <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
        {isRecording && stream ? (
          <>
            <video
              ref={liveVideoRef}
              autoPlay
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Webcam Overlay */}
            <WebcamOverlay
              webcamStream={webcamStream}
              isVisible={showWebcamOverlay}
              position={webcamOverlayPosition}
              size={webcamOverlaySize}
              shape={webcamOverlayShape}
              onToggleVisibility={onToggleWebcamOverlay}
            />
          </>
        ) : recordedBlob ? (
          <video
            ref={playbackVideoRef}
            controls
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="text-6xl mb-4">🎥</div>
              <p className="text-lg">Ready to record</p>
              <p className="text-sm">Click "Start Recording" to begin</p>
            </div>
          </div>
        )}
        
        {isRecording && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        )}
      </div>
    </Card>
  );
};
