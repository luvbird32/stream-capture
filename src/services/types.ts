
export interface RecordingOptions {
  includeAudio: boolean;
  includeWebcam: boolean;
  quality: 'low' | 'medium' | 'high';
  frameRate: number;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  recordedBlob: Blob | null;
}
