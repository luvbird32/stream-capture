
import React, { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface RecordingPreviewProps {
  stream: MediaStream | null;
  isRecording: boolean;
  recordedBlob: Blob | null;
}

export const RecordingPreview: React.FC<RecordingPreviewProps> = ({
  stream,
  isRecording,
  recordedBlob,
}) => {
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const playbackVideoRef = useRef<HTMLVideoElement>(null);

  // Handle live stream for recording
  useEffect(() => {
    console.log('Live stream effect:', { stream: !!stream, isRecording });
    if (liveVideoRef.current && stream && isRecording) {
      liveVideoRef.current.srcObject = stream;
      liveVideoRef.current.play().catch(console.error);
    }
  }, [stream, isRecording]);

  // Handle recorded blob for playback
  useEffect(() => {
    console.log('Recorded blob effect:', { 
      hasBlob: !!recordedBlob, 
      blobSize: recordedBlob?.size,
      isRecording 
    });
    
    if (playbackVideoRef.current && recordedBlob && !isRecording) {
      const url = URL.createObjectURL(recordedBlob);
      console.log('Setting playback video src to:', url);
      playbackVideoRef.current.src = url;
      playbackVideoRef.current.load();
      
      return () => {
        console.log('Cleaning up blob URL:', url);
        URL.revokeObjectURL(url);
      };
    }
  }, [recordedBlob, isRecording]);

  // Determine what to show
  const showLivePreview = isRecording && !!stream;
  const showRecordedVideo = !isRecording && !!recordedBlob;
  const showPlaceholder = !showLivePreview && !showRecordedVideo;

  console.log('Render state:', { 
    showLivePreview, 
    showRecordedVideo, 
    showPlaceholder,
    isRecording,
    hasStream: !!stream,
    hasBlob: !!recordedBlob
  });

  return (
    <Card className="p-4 bg-card/95 backdrop-blur-sm border-border/50">
      <div className="w-full bg-muted rounded-lg overflow-hidden relative" style={{ aspectRatio: '16/9' }}>
        {showLivePreview && (
          <video
            ref={liveVideoRef}
            autoPlay
            muted
            className="w-full h-full object-contain bg-black"
          />
        )}

        {showRecordedVideo && (
          <video
            ref={playbackVideoRef}
            controls
            className="w-full h-full object-contain bg-black"
            onLoadedMetadata={() => console.log('Video metadata loaded')}
            onCanPlay={() => console.log('Video can play')}
            onError={(e) => console.error('Video error:', e)}
          />
        )}

        {showPlaceholder && (
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
            RECORDING
          </div>
        )}
      </div>
    </Card>
  );
};
