
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PictureInPicture, PictureInPicture2 } from 'lucide-react';
import { usePictureInPicture } from '../hooks/usePictureInPicture';

interface PictureInPictureWebcamProps {
  webcamStream: MediaStream | null;
  isRecording: boolean;
  onPipStatusChange: (isActive: boolean) => void;
}

export const PictureInPictureWebcam: React.FC<PictureInPictureWebcamProps> = ({
  webcamStream,
  isRecording,
  onPipStatusChange,
}) => {
  const { isPipActive, startPictureInPicture, stopPictureInPicture, isSupported } = usePictureInPicture();

  useEffect(() => {
    onPipStatusChange(isPipActive);
  }, [isPipActive, onPipStatusChange]);

  const handleTogglePip = async () => {
    if (isPipActive) {
      await stopPictureInPicture();
    } else {
      await startPictureInPicture(webcamStream);
    }
  };

  if (!isSupported) {
    return (
      <Card className="bg-card/95 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Webcam Overlay</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Picture-in-Picture is not supported in this browser.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Floating Webcam</CardTitle>
        <p className="text-sm text-muted-foreground">
          Create a floating webcam window that stays on top while recording
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleTogglePip}
          disabled={!webcamStream}
          className="w-full"
          variant={isPipActive ? "destructive" : "default"}
        >
          {isPipActive ? (
            <>
              <PictureInPicture2 className="w-4 h-4 mr-2" />
              Close Floating Webcam
            </>
          ) : (
            <>
              <PictureInPicture className="w-4 h-4 mr-2" />
              Open Floating Webcam
            </>
          )}
        </Button>
        
        {!webcamStream && (
          <p className="text-sm text-muted-foreground">
            Enable webcam in recording settings to use floating webcam.
          </p>
        )}
        
        {isPipActive && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              ✓ Floating webcam is active and will stay on top while you work in other applications.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
