
import { RecordingOptions } from './types';
import { getOverlayDimensions, getOverlayPosition } from './overlayUtils';

export class StreamComposer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrame: number | null = null;
  private screenVideo: HTMLVideoElement | null = null;
  private webcamVideo: HTMLVideoElement | null = null;

  createCompositeStream(
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
    const { width: overlayWidth, height: overlayHeight } = getOverlayDimensions(overlayOptions.size);
    const { x: overlayX, y: overlayY } = getOverlayPosition(overlayOptions.position, overlayWidth, overlayHeight);

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

  cleanup(): void {
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

    // Clean up canvas
    this.canvas = null;
    this.ctx = null;
  }
}
