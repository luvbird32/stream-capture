
import { RecordingOptions } from './types';
import { MediaRecorderManager } from './mediaRecorderManager';

export type { RecordingOptions, RecordingState } from './types';

export class RecordingService {
  private screenStream: MediaStream | null = null;
  private microphoneStream: MediaStream | null = null;
  private combinedStream: MediaStream | null = null;
  private startTime: number = 0;
  private pauseStartTime: number = 0;
  private totalPausedTime: number = 0;
  private mediaRecorderManager = new MediaRecorderManager();

  async startRecording(options: RecordingOptions): Promise<{ screenStream: MediaStream }> {
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

      this.screenStream = screenStream;

      // Get microphone if requested
      if (options.includeMicrophone) {
        try {
          this.microphoneStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            },
            video: false
          });
          console.log('Microphone access granted');
        } catch (micError) {
          console.warn('Could not access microphone:', micError);
        }
      }

      // Combine audio streams if we have microphone
      let recordingStream = screenStream;
      if (this.microphoneStream) {
        const audioTracks: MediaStreamTrack[] = [];
        
        // Add screen audio if available
        const screenAudioTracks = screenStream.getAudioTracks();
        audioTracks.push(...screenAudioTracks);
        
        // Add microphone audio
        const micAudioTracks = this.microphoneStream.getAudioTracks();
        audioTracks.push(...micAudioTracks);
        
        // Create combined stream with video from screen and combined audio
        const videoTracks = screenStream.getVideoTracks();
        this.combinedStream = new MediaStream([...videoTracks, ...audioTracks]);
        recordingStream = this.combinedStream;
      }

      this.startTime = Date.now();
      this.totalPausedTime = 0;

      // Record the stream (with or without microphone)
      const mediaRecorder = this.mediaRecorderManager.createRecorder(recordingStream);
      this.mediaRecorderManager.start();
      
      return { screenStream };
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
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
    // Stop streams
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }
    if (this.microphoneStream) {
      this.microphoneStream.getTracks().forEach(track => track.stop());
      this.microphoneStream = null;
    }
    if (this.combinedStream) {
      this.combinedStream = null;
    }
  }
}
