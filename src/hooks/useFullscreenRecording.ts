
import { useState, useCallback } from 'react';

export const useFullscreenRecording = () => {
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);

  const enterFullscreenMode = useCallback(() => {
    setIsFullscreenMode(true);
  }, []);

  const exitFullscreenMode = useCallback(() => {
    setIsFullscreenMode(false);
  }, []);

  return {
    isFullscreenMode,
    enterFullscreenMode,
    exitFullscreenMode,
  };
};
