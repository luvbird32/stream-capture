
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

export class RecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private webcamStream: MediaStream | null = null;
  private recordedChunks: Blob[] = [];
  private startTime: number = 0;
  private pauseStartTime: number = 0;
  private totalPausedTime: number = 0;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrame: number | null = null;
  private screenVideo: HTMLVideoElement | null = null;
  private webcamVideo: HTMLVideoElement | null = null;

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
        finalStream = this.createCompositeStream(screenStream, webcamStream, options.webcamOverlay);
      }

      this.recordedChunks = [];
      this.startTime = Date.now();
      this.totalPausedTime = 0;

      // Setup MediaRecorder with the final stream
      this.mediaRecorder = new MediaRecorder(finalStream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(1000); // Collect data every second
      return { screenStream, webcamStream };
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  private createCompositeStream(
    screenStream: MediaStream, 
    webcamStream: MediaStream, 
    overlayOptions: NonNullable<RecordingOptions['webcamOverlay']>
  ): MediaStream {
    // Create canvas for composition
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1920;
    this.canvas.height = 1080;
    this.ctx = this.canvas.getContext('2d');

    if (!this.ctx) {
      throw new Error('Could not get canvas context');
    }

    // Create video elements that will persist throughout recording
    this.screenVideo = document.createElement('video');
    this.webcamVideo = document.createElement('video');
    
    this.screenVideo.srcObject = screenStream;
    this.webcamVideo.srcObject = webcamStream;
    
    // Ensure videos are muted to prevent audio feedback
    this.screenVideo.muted = true;
    this.webcamVideo.muted = true;
    
    // Set video properties for better performance
    this.screenVideo.playsInline = true;
    this.webcamVideo.playsInline = true;
    
    // Start playing videos
    this.screenVideo.play().catch(console.error);
    this.webcamVideo.play().catch(console.error);

    // Calculate webcam overlay dimensions and position
    const { width: overlayWidth, height: overlayHeight } = this.getOverlayDimensions(overlayOptions.size);
    const { x: overlayX, y: overlayY } = this.getOverlayPosition(overlayOptions.position, overlayWidth, overlayHeight);

    // Composite frame drawing function that runs continuously
    const drawFrame = () => {
      if (!this.ctx || !this.canvas || !this.screenVideo || !this.webcamVideo) {
        return;
      }

      // Only draw if videos are ready
      if (this.screenVideo.readyState >= 2 && this.webcamVideo.readyState >= 2) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw screen capture (full size)
        this.ctx.drawImage(this.screenVideo, 0, 0, this.canvas.width, this.canvas.height);

        // Draw webcam overlay
        if (overlayOptions.shape === 'circle') {
          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.arc(overlayX + overlayWidth/2, overlayY + overlayHeight/2, overlayWidth/2, 0, 2 * Math.PI);
          this.ctx.clip();
          this.ctx.drawImage(this.webcamVideo, overlayX, overlayY, overlayWidth, overlayHeight);
          this.ctx.restore();
        } else {
          this.ctx.drawImage(this.webcamVideo, overlayX, overlayY, overlayWidth, overlayHeight);
        }
      }

      // Continue the animation loop
      this.animationFrame = requestAnimationFrame(drawFrame);
    };

    // Start drawing frames
    drawFrame();

    // Create stream from canvas at 30 FPS
    const compositeStream = this.canvas.captureStream(30);
    
    // Add audio from screen stream
    const audioTracks = screenStream.getAudioTracks();
    audioTracks.forEach(track => compositeStream.addTrack(track));

    return compositeStream;
  }

  private getOverlayDimensions(size: 'small' | 'medium' | 'large') {
    switch (size) {
      case 'small': return { width: 240, height: 180 };
      case 'medium': return { width: 320, height: 240 };
      case 'large': return { width: 400, height: 300 };
      default: return { width: 320, height: 240 };
    }
  }

  private getOverlayPosition(
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
    width: number,
    height: number
  ) {
    const margin = 20;
    switch (position) {
      case 'top-left': return { x: margin, y: margin };
      case 'top-right': return { x: 1920 - width - margin, y: margin };
      case 'bottom-left': return { x: margin, y: 1080 - height - margin };
      case 'bottom-right': return { x: 1920 - width - margin, y: 1080 - height - margin };
      default: return { x: 1920 - width - margin, y: 1080 - height - margin };
    }
  }

  getWebcamStream(): MediaStream | null {
    return this.webcamStream;
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
    // Stop animation frame
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    // Clean up video elements
    if (this.screenVideo) {
      this.screenVideo.pause();
      this.screenVideo.srcObject = null;
      this.screenVideo = null;
    }

    if (this.webcamVideo) {
      this.webcamVideo.pause();
      this.webcamVideo.srcObject = null;
      this.webcamVideo = null;
    }

    // Stop streams
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.webcamStream) {
      this.webcamStream.getTracks().forEach(track => track.stop());
      this.webcamStream = null;
    }

    // Clean up canvas
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.canvas = null;
    this.ctx = null;
  }
}
