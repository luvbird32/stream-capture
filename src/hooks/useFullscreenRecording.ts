
import { useState, useCallback, useEffect } from 'react';

export const useFullscreenRecording = () => {
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);

  const enterFullscreenMode = useCallback(() => {
    setIsFullscreenMode(true);
  }, []);

  const exitFullscreenMode = useCallback(() => {
    setIsFullscreenMode(false);
    // Ensure we exit fullscreen if still in it
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(console.error);
    }
  }, []);

  // Listen for fullscreen changes from external sources (like ESC key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      // If fullscreen was exited externally and we're supposed to be in fullscreen mode
      if (!document.fullscreenElement && isFullscreenMode) {
        setIsFullscreenMode(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreenMode]);

  return {
    isFullscreenMode,
    enterFullscreenMode,
    exitFullscreenMode,
  };
};
