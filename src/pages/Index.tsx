
import React, { useState } from 'react';
import { RecordingControls } from '../components/RecordingControls';
import { RecordingSettings } from '../components/RecordingSettings';
import { RecordingPreview } from '../components/RecordingPreview';
import { RecordingManager } from '../components/RecordingManager';
import { LiveStreamPanel } from '../components/LiveStreamPanel';
import { useRecording } from '../hooks/useRecording';
import { RecordingOptions } from '../services/RecordingService';
import { useToast } from '@/hooks/use-toast';

interface Recording {
  id: string;
  name: string;
  duration: number;
  size: number;
  createdAt: Date;
  blob: Blob;
  thumbnail?: string;
}

const Index = () => {
  const { toast } = useToast();
  const recording = useRecording();
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  
  const [recordingOptions, setRecordingOptions] = useState<RecordingOptions>({
    includeAudio: true,
    includeWebcam: false,
    quality: 'medium',
    frameRate: 30,
  });

  const handleStartRecording = async () => {
    try {
      const recordingStream = await recording.startRecording(recordingOptions);
      setStream(recordingStream);
      toast({
        title: "Recording Started",
        description: "Your screen recording has begun.",
      });
    } catch (error) {
      toast({
        title: "Recording Failed",
        description: "Unable to start recording. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = async () => {
    try {
      const blob = await recording.stopRecording();
      setStream(null);
      
      // Create new recording entry
      const newRecording: Recording = {
        id: Date.now().toString(),
        name: `Recording ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        duration: recording.duration,
        size: blob.size,
        createdAt: new Date(),
        blob,
      };
      
      setRecordings(prev => [newRecording, ...prev]);
      
      toast({
        title: "Recording Saved",
        description: "Your recording has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Unable to save recording.",
        variant: "destructive",
      });
    }
  };

  const handleShareRecording = (recordingToShare: Recording) => {
    // In a real app, this would upload to a cloud service
    const shareUrl = `https://your-app.com/watch/${recordingToShare.id}`;
    navigator.clipboard.writeText(shareUrl);
    
    toast({
      title: "Share Link Copied",
      description: "Recording share link copied to clipboard.",
    });
  };

  const handleDeleteRecording = (id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id));
    toast({
      title: "Recording Deleted",
      description: "Recording has been removed.",
    });
  };

  const handleStartStream = (streamKey: string, platform: string) => {
    // In a real app, this would connect to RTMP endpoint
    setIsStreaming(true);
    console.log('Starting stream with key:', streamKey, 'platform:', platform);
  };

  const handleStopStream = () => {
    setIsStreaming(false);
    toast({
      title: "Stream Ended",
      description: "Live stream has been stopped.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
            LoomClone Studio
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional screen recording and live streaming platform for content creators
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Recording Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preview */}
            <RecordingPreview
              stream={stream}
              isRecording={recording.isRecording}
              recordedBlob={recording.recordedBlob}
            />
            
            {/* Controls */}
            <RecordingControls
              isRecording={recording.isRecording}
              isPaused={recording.isPaused}
              duration={recording.duration}
              onStart={handleStartRecording}
              onPause={recording.pauseRecording}
              onResume={recording.resumeRecording}
              onStop={handleStopRecording}
              disabled={isStreaming}
            />
          </div>

          {/* Settings and Management Sidebar */}
          <div className="space-y-6">
            {/* Recording Settings */}
            <RecordingSettings
              options={recordingOptions}
              onChange={setRecordingOptions}
              disabled={recording.isRecording || isStreaming}
            />

            {/* Live Streaming */}
            <LiveStreamPanel
              isStreaming={isStreaming}
              onStartStream={handleStartStream}
              onStopStream={handleStopStream}
              viewerCount={Math.floor(Math.random() * 100)}
            />
          </div>
        </div>

        {/* Recording Management */}
        <div className="mt-8">
          <RecordingManager
            recordings={recordings}
            onShare={handleShareRecording}
            onDelete={handleDeleteRecording}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
