
import { useState, useRef, useCallback } from 'react';

export const usePopupWebcam = () => {
  const [isPopupActive, setIsPopupActive] = useState(false);
  const [popupWindow, setPopupWindow] = useState<Window | null>(null);
  const popupVideoRef = useRef<HTMLVideoElement | null>(null);

  const startPopupWebcam = useCallback(async (webcamStream: MediaStream | null) => {
    if (!webcamStream) {
      console.warn('No webcam stream available for popup');
      return false;
    }

    try {
      console.log('Starting popup webcam with stream:', webcamStream);
      
      // Create popup window
      const popup = window.open(
        '',
        'webcam-popup',
        'width=320,height=240,left=100,top=100,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no'
      );

      if (!popup) {
        console.warn('Popup blocked or failed to open');
        return false;
      }

      // Set up popup window content
      popup.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Webcam</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                background: #000;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                overflow: hidden;
              }
              video {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 8px;
                border: 2px solid #ef4444;
              }
            </style>
          </head>
          <body>
            <video id="webcam-video" autoplay muted playsinline></video>
          </body>
        </html>
      `);
      popup.document.close();

      // Get video element and set stream
      const video = popup.document.getElementById('webcam-video') as HTMLVideoElement;
      if (video) {
        video.srcObject = webcamStream;
        popupVideoRef.current = video;
        console.log('Webcam stream assigned to popup video');
      }

      setIsPopupActive(true);
      setPopupWindow(popup);

      // Handle popup close
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          console.log('Popup window closed');
          clearInterval(checkClosed);
          setIsPopupActive(false);
          setPopupWindow(null);
          popupVideoRef.current = null;
        }
      }, 1000);

      return true;
    } catch (error) {
      console.error('Failed to start popup webcam:', error);
      return false;
    }
  }, []);

  const stopPopupWebcam = useCallback(() => {
    console.log('Stopping popup webcam');
    if (popupWindow && !popupWindow.closed) {
      popupWindow.close();
    }
    setIsPopupActive(false);
    setPopupWindow(null);
    popupVideoRef.current = null;
  }, [popupWindow]);

  return {
    isPopupActive,
    popupWindow,
    startPopupWebcam,
    stopPopupWebcam,
    isSupported: true,
  };
};
