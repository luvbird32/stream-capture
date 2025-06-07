
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

export class RecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private recordedChunks: Blob[] = [];
  private startTime: number = 0;
  private pauseStartTime: number = 0;
  private totalPausedTime: number = 0;

  async startRecording(options: RecordingOptions): Promise<MediaStream> {
    try {
      // Get screen capture
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: options.frameRate,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: options.includeAudio
      });

      let combinedStream = screenStream;

      // Add webcam if requested
      if (options.includeWebcam) {
        const webcamStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false // Audio already handled by screen capture
        });
        
        // Combine streams (this would need more complex implementation for PiP)
        combinedStream = new MediaStream([
          ...screenStream.getVideoTracks(),
          ...screenStream.getAudioTracks(),
          ...webcamStream.getVideoTracks()
        ]);
      }

      this.stream = combinedStream;
      this.recordedChunks = [];
      this.startTime = Date.now();
      this.totalPausedTime = 0;

      // Setup MediaRecorder
      this.mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(1000); // Collect data every second
      return combinedStream;
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.pauseStartTime = Date.now();
    }
  }

  resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.totalPausedTime += Date.now() - this.pauseStartTime;
    }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        throw new Error('No active recording');
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        this.cleanup();
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  getDuration(): number {
    if (!this.startTime) return 0;
    const currentTime = Date.now();
    return currentTime - this.startTime - this.totalPausedTime;
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.recordedChunks = [];
  }
}
