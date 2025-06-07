
export class MediaRecorderManager {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  createRecorder(stream: MediaStream): MediaRecorder {
    this.recordedChunks = [];
    
    // Try MP4 format first, fallback to WebM if not supported
    let mimeType = 'video/mp4';
    if (!MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = 'video/webm;codecs=vp9';
      console.warn('MP4 not supported, falling back to WebM');
    }

    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: mimeType
    });

    this.mediaRecorder.ondataavailable = (event) => {
      console.log('MediaRecorder data available, size:', event.data.size);
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.onerror = (event) => {
      console.error('MediaRecorder error:', event);
    };

    return this.mediaRecorder;
  }

  start(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
      console.log('Starting MediaRecorder');
      this.mediaRecorder.start(1000); // Collect data every second
    }
  }

  pause(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      console.log('Pausing MediaRecorder');
      this.mediaRecorder.pause();
    }
  }

  resume(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      console.log('Resuming MediaRecorder');
      this.mediaRecorder.resume();
    }
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        console.error('No MediaRecorder to stop');
        reject(new Error('No active recording'));
        return;
      }

      console.log('Stopping MediaRecorder, current state:', this.mediaRecorder.state);

      if (this.mediaRecorder.state === 'inactive') {
        console.warn('MediaRecorder already inactive');
        const mimeType = this.mediaRecorder.mimeType.includes('mp4') ? 'video/mp4' : 'video/webm';
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        this.cleanup();
        resolve(blob);
        return;
      }

      const handleStop = () => {
        console.log('MediaRecorder stopped, chunks:', this.recordedChunks.length);
        const mimeType = this.mediaRecorder!.mimeType.includes('mp4') ? 'video/mp4' : 'video/webm';
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        console.log('Created blob with size:', blob.size, 'and type:', mimeType);
        this.cleanup();
        resolve(blob);
      };

      const handleError = (error: Event) => {
        console.error('Error stopping MediaRecorder:', error);
        this.cleanup();
        reject(new Error('Failed to stop recording'));
      };

      // Set up event handlers
      this.mediaRecorder.onstop = handleStop;
      this.mediaRecorder.onerror = handleError;

      // Stop the recorder
      try {
        this.mediaRecorder.stop();
      } catch (error) {
        console.error('Error calling stop():', error);
        this.cleanup();
        reject(error);
      }
    });
  }

  getState(): string | undefined {
    return this.mediaRecorder?.state;
  }

  private cleanup(): void {
    console.log('Cleaning up MediaRecorderManager');
    if (this.mediaRecorder) {
      // Remove event handlers to prevent memory leaks
      this.mediaRecorder.ondataavailable = null;
      this.mediaRecorder.onstop = null;
      this.mediaRecorder.onerror = null;
    }
    this.mediaRecorder = null;
    this.recordedChunks = [];
  }
}
