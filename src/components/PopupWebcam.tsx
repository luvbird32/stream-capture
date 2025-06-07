
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, X } from 'lucide-react';
import { usePopupWebcam } from '../hooks/usePopupWebcam';

interface PopupWebcamProps {
  webcamStream: MediaStream | null;
  isRecording: boolean;
  onPopupStatusChange: (isActive: boolean) => void;
}

export const PopupWebcam: React.FC<PopupWebcamProps> = ({
  webcamStream,
  isRecording,
  onPopupStatusChange,
}) => {
  const { isPopupActive, startPopupWebcam, stopPopupWebcam, isSupported } = usePopupWebcam();

  useEffect(() => {
    onPopupStatusChange(isPopupActive);
  }, [isPopupActive, onPopupStatusChange]);

  const handleTogglePopup = async () => {
    if (isPopupActive) {
      stopPopupWebcam();
    } else {
      await startPopupWebcam(webcamStream);
    }
  };

  if (!isSupported) {
    return (
      <Card className="bg-card/95 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Webcam Window</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Popup windows are not supported in this browser.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Floating Webcam Window</CardTitle>
        <p className="text-sm text-muted-foreground">
          Open webcam in a separate window that you can move anywhere on your screen
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleTogglePopup}
          disabled={!webcamStream}
          className="w-full"
          variant={isPopupActive ? "destructive" : "default"}
        >
          {isPopupActive ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Close Webcam Window
            </>
          ) : (
            <>
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Webcam Window
            </>
          )}
        </Button>
        
        {!webcamStream && (
          <p className="text-sm text-muted-foreground">
            Enable webcam in recording settings to use floating webcam window.
          </p>
        )}
        
        {isPopupActive && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              ✓ Webcam window is open. You can move and resize it anywhere on your screen.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
