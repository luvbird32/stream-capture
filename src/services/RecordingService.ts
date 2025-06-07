
import { RecordingOptions } from './types';
import { MediaRecorderManager } from './mediaRecorderManager';
import { ChromeExtensionService } from './ChromeExtensionService';
import { SecurityUtils } from '../lib/security';

export type { RecordingOptions, RecordingState } from './types';

export class RecordingService {
  private screenStream: MediaStream | null = null;
  private microphoneStream: MediaStream | null = null;
  private combinedStream: MediaStream | null = null;
  private startTime: number = 0;
  private pauseStartTime: number = 0;
  private totalPausedTime: number = 0;
  private mediaRecorderManager = new MediaRecorderManager();
  private isRecording = false;
  private cleanupTimeouts: NodeJS.Timeout[] = [];

  async startRecording(options: RecordingOptions): Promise<{ screenStream: MediaStream }> {
    try {
      // Prevent multiple simultaneous recordings
      if (this.isRecording) {
        throw new Error('Recording already in progress');
      }

      let screenStream: MediaStream;

      // Use Chrome extension API if available, otherwise fall back to regular getDisplayMedia
      if (ChromeExtensionService.isExtension()) {
        console.log('Using Chrome extension desktop capture API');
        screenStream = await ChromeExtensionService.getDesktopStream();
      } else {
        console.log('Using standard getDisplayMedia API');
        screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            frameRate: options.frameRate,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: options.includeAudio
        });
      }

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
          // Continue without microphone instead of failing completely
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
      this.isRecording = true;

      // Record the stream (with or without microphone)
      const mediaRecorder = this.mediaRecorderManager.createRecorder(recordingStream);
      this.mediaRecorderManager.start();
      
      // Set up automatic cleanup timeout (safety measure)
      const cleanupTimeout = setTimeout(() => {
        console.warn('Recording cleanup timeout reached, forcing stop');
        this.forceCleanup();
      }, 4 * 60 * 60 * 1000); // 4 hours max recording time
      
      this.cleanupTimeouts.push(cleanupTimeout);
      
      return { screenStream };
    } catch (error) {
      console.error('Error starting recording:', error);
      this.cleanup();
      throw error;
    }
  }

  pauseRecording(): void {
    if (!this.isRecording) {
      console.warn('No active recording to pause');
      return;
    }
    this.mediaRecorderManager.pause();
    this.pauseStartTime = Date.now();
  }

  resumeRecording(): void {
    if (!this.isRecording) {
      console.warn('No active recording to resume');
      return;
    }
    this.mediaRecorderManager.resume();
    this.totalPausedTime += Date.now() - this.pauseStartTime;
  }

  stopRecording(): Promise<Blob> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.isRecording) {
          throw new Error('No active recording to stop');
        }

        const blob = await this.mediaRecorderManager.stop();
        
        // Validate blob size for security
        if (!SecurityUtils.validateBlobSize(blob)) {
          console.warn('Recording blob exceeds maximum allowed size');
          // Still resolve but log the security event
        }
        
        this.cleanup();
        resolve(blob);
      } catch (error) {
        console.error('Error stopping recording:', error);
        this.cleanup();
        reject(error);
      }
    });
  }

  getDuration(): number {
    if (!this.startTime || !this.isRecording) return 0;
    const currentTime = Date.now();
    return currentTime - this.startTime - this.totalPausedTime;
  }

  private forceCleanup(): void {
    console.log('Force cleaning up RecordingService due to timeout');
    this.cleanup();
  }

  private cleanup(): void {
    console.log('Cleaning up RecordingService');
    this.isRecording = false;
    
    // Clear all cleanup timeouts
    this.cleanupTimeouts.forEach(timeout => clearTimeout(timeout));
    this.cleanupTimeouts = [];
    
    // Stop streams with error handling
    if (this.screenStream) {
      try {
        this.screenStream.getTracks().forEach(track => {
          if (track.readyState === 'live') {
            track.stop();
          }
        });
      } catch (error) {
        console.warn('Error stopping screen stream:', error);
      }
      this.screenStream = null;
    }
    
    if (this.microphoneStream) {
      try {
        this.microphoneStream.getTracks().forEach(track => {
          if (track.readyState === 'live') {
            track.stop();
          }
        });
      } catch (error) {
        console.warn('Error stopping microphone stream:', error);
      }
      this.microphoneStream = null;
    }
    
    if (this.combinedStream) {
      this.combinedStream = null;
    }
  }
}
