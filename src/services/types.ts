
export interface RecordingOptions {
  includeAudio: boolean;
  includeWebcam: boolean;
  quality: 'low' | 'medium' | 'high';
  frameRate: number;
  webcamOverlay?: {
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    size: 'small' | 'medium' | 'large';
    shape: 'circle' | 'rounded';
    show: boolean;
  };
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  recordedBlob: Blob | null;
}

export interface OverlayDimensions {
  width: number;
  height: number;
}

export interface OverlayPosition {
  x: number;
  y: number;
}
