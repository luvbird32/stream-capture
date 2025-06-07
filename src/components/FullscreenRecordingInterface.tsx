
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { WebcamOverlay } from './WebcamOverlay';
import { Square, Pause, Play } from 'lucide-react';

interface FullscreenRecordingInterfaceProps {
  webcamStream: MediaStream | null;
  onStartRecording: () => Promise<void>;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  webcamOverlayPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  webcamOverlaySize: 'small' | 'medium' | 'large';
  webcamOverlayShape: 'circle' | 'rounded';
  showWebcamOverlay: boolean;
  onToggleWebcamOverlay: () => void;
  onExit: () => void;
}

export const FullscreenRecordingInterface: React.FC<FullscreenRecordingInterfaceProps> = ({
  webcamStream,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  isRecording,
  isPaused,
  duration,
  webcamOverlayPosition,
  webcamOverlaySize,
  webcamOverlayShape,
  showWebcamOverlay,
  onToggleWebcamOverlay,
  onExit,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const enterFullscreen = async () => {
      if (containerRef.current) {
        try {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        } catch (error) {
          console.error('Failed to enter fullscreen:', error);
        }
      }
    };

    enterFullscreen();

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement) {
        onExit();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [onExit]);

  const handleExitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

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
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      {/* Main content area */}
      <div className="relative w-full h-full">
        {!isRecording ? (
          /* Pre-recording state */
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">🎥</div>
              <h2 className="text-3xl font-bold mb-4">Ready to Record</h2>
              <p className="text-lg mb-8">Click start to select your screen and begin recording</p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={onStartRecording}
                  size="lg"
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8"
                >
                  Start Recording
                </Button>
                <Button
                  onClick={handleExitFullscreen}
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Recording state */
          <div className="w-full h-full relative">
            {/* Webcam overlay */}
            <WebcamOverlay
              webcamStream={webcamStream}
              isVisible={showWebcamOverlay}
              position={webcamOverlayPosition}
              size={webcamOverlaySize}
              shape={webcamOverlayShape}
              onToggleVisibility={onToggleWebcamOverlay}
            />

            {/* Recording controls - floating at bottom center */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
              <div className="bg-black/80 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-4">
                {/* Recording indicator */}
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
                  <span className="text-white font-mono text-lg font-medium">
                    {formatDuration(duration)}
                  </span>
                </div>

                {/* Control buttons */}
                <div className="flex gap-2">
                  {isPaused ? (
                    <Button
                      onClick={onResumeRecording}
                      size="sm"
                      variant="outline"
                      className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={onPauseRecording}
                      size="sm"
                      variant="outline"
                      className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
                    >
                      <Pause className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    onClick={onStopRecording}
                    size="sm"
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <Square className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Recording status indicator - top left */}
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 z-30">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              {isPaused ? 'PAUSED' : 'RECORDING'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
