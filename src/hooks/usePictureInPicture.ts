
import { useState, useRef, useCallback } from 'react';

export const usePictureInPicture = () => {
  const [isPipActive, setIsPipActive] = useState(false);
  const [pipWindow, setPipWindow] = useState<PictureInPictureWindow | null>(null);
  const pipVideoRef = useRef<HTMLVideoElement>(null);

  const startPictureInPicture = useCallback(async (webcamStream: MediaStream | null) => {
    if (!webcamStream || !document.pictureInPictureEnabled) {
      console.warn('Picture-in-Picture not supported or no webcam stream');
      return false;
    }

    try {
      // Create a video element for PiP
      const video = document.createElement('video');
      video.srcObject = webcamStream;
      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;
      
      // Style the video
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      video.style.borderRadius = '50%';
      video.style.border = '3px solid #ef4444';
      video.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';

      // Wait for the video to load
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      // Request Picture-in-Picture
      const pipWindow = await video.requestPictureInPicture();
      
      setIsPipActive(true);
      setPipWindow(pipWindow);
      pipVideoRef.current = video;

      // Handle when PiP is closed
      video.addEventListener('leavepictureinpicture', () => {
        setIsPipActive(false);
        setPipWindow(null);
        pipVideoRef.current = null;
      });

      return true;
    } catch (error) {
      console.error('Failed to start Picture-in-Picture:', error);
      return false;
    }
  }, []);

  const stopPictureInPicture = useCallback(async () => {
    if (pipVideoRef.current && document.pictureInPictureElement) {
      try {
        await document.exitPictureInPicture();
      } catch (error) {
        console.error('Failed to exit Picture-in-Picture:', error);
      }
    }
    setIsPipActive(false);
    setPipWindow(null);
    pipVideoRef.current = null;
  }, []);

  return {
    isPipActive,
    pipWindow,
    startPictureInPicture,
    stopPictureInPicture,
    isSupported: document.pictureInPictureEnabled,
  };
};
