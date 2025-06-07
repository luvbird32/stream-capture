
import { RecordingOptions } from './types';
import { StreamComposer } from './streamComposer';
import { MediaRecorderManager } from './mediaRecorderManager';

export { RecordingOptions, RecordingState } from './types';

export class RecordingService {
  private stream: MediaStream | null = null;
  private webcamStream: MediaStream | null = null;
  private startTime: number = 0;
  private pauseStartTime: number = 0;
  private totalPausedTime: number = 0;
  private streamComposer = new StreamComposer();
  private mediaRecorderManager = new MediaRecorderManager();

  async startRecording(options: RecordingOptions): Promise<{ screenStream: MediaStream; webcamStream?: MediaStream }> {
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

      this.stream = screenStream;
      let webcamStream: MediaStream | undefined;

      // Get webcam if requested
      if (options.includeWebcam) {
        try {
          webcamStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 }
            },
            audio: false // Audio already handled by screen capture
          });
          this.webcamStream = webcamStream;
        } catch (webcamError) {
          console.warn('Could not access webcam:', webcamError);
          // Continue without webcam
        }
      }

      // Always create composite stream if we have webcam and overlay is enabled
      let finalStream = screenStream;
      if (webcamStream && options.webcamOverlay?.show) {
        finalStream = this.streamComposer.createCompositeStream(screenStream, webcamStream, options.webcamOverlay);
      }

      this.startTime = Date.now();
      this.totalPausedTime = 0;

      // Setup MediaRecorder with the final stream
      const mediaRecorder = this.mediaRecorderManager.createRecorder(finalStream);
      this.mediaRecorderManager.start();
      
      return { screenStream, webcamStream };
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  getWebcamStream(): MediaStream | null {
    return this.webcamStream;
  }

  pauseRecording(): void {
    this.mediaRecorderManager.pause();
    this.pauseStartTime = Date.now();
  }

  resumeRecording(): void {
    this.mediaRecorderManager.resume();
    this.totalPausedTime += Date.now() - this.pauseStartTime;
  }

  stopRecording(): Promise<Blob> {
    return new Promise(async (resolve) => {
      try {
        const blob = await this.mediaRecorderManager.stop();
        this.cleanup();
        resolve(blob);
      } catch (error) {
        this.cleanup();
        throw error;
      }
    });
  }

  getDuration(): number {
    if (!this.startTime) return 0;
    const currentTime = Date.now();
    return currentTime - this.startTime - this.totalPausedTime;
  }

  private cleanup(): void {
    // Clean up stream composer
    this.streamComposer.cleanup();

    // Stop streams
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.webcamStream) {
      this.webcamStream.getTracks().forEach(track => track.stop());
      this.webcamStream = null;
    }
  }
}
