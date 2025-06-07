
import React from 'react';
import { RecordingControls } from './RecordingControls';
import { RecordingSettings } from './RecordingSettings';
import { RecordingOptions } from '../services/RecordingService';

interface CaptureModeProps {
  stream: MediaStream | null;
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  recordedBlob: Blob | null;
  recordingOptions: RecordingOptions;
  onStartRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onStopRecording: () => void;
  onOptionsChange: (options: RecordingOptions) => void;
}

export const CaptureMode: React.FC<CaptureModeProps> = ({
  stream,
  isRecording,
  isPaused,
  duration,
  recordedBlob,
  recordingOptions,
  onStartRecording,
  onPauseRecording,
  onResumeRecording,
  onStopRecording,
  onOptionsChange,
}) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Main Recording Area */}
      <div className="xl:col-span-2 space-y-6">
        {/* Controls */}
        <RecordingControls
          isRecording={isRecording}
          isPaused={isPaused}
          duration={duration}
          onStart={onStartRecording}
          onPause={onPauseRecording}
          onResume={onResumeRecording}
          onStop={onStopRecording}
        />
      </div>

      {/* Settings Sidebar */}
      <div className="xl:col-span-1 space-y-6">
        {/* Recording Settings */}
        <RecordingSettings
          options={recordingOptions}
          onChange={onOptionsChange}
          disabled={isRecording}
          showWebcamOverlay={false}
          webcamOverlayPosition="bottom-right"
          webcamOverlaySize="medium"
          webcamOverlayShape="circle"
          onToggleWebcamOverlay={() => {}}
          onWebcamOverlayPositionChange={() => {}}
          onWebcamOverlaySizeChange={() => {}}
          onWebcamOverlayShapeChange={() => {}}
        />
      </div>
    </div>
  );
};
