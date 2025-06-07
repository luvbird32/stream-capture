
import React, { useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { CaptureMode } from '../components/CaptureMode';
import { ProjectManager } from '../components/ProjectManager';
import { VideoEditor } from '../components/VideoEditor';
import { useRecordingManager } from '../hooks/useRecordingManager';

type AppMode = 'capture' | 'projects' | 'editing';

const Index = () => {
  const [currentMode, setCurrentMode] = useState<AppMode>('capture');
  const {
    stream,
    projects,
    editingProject,
    recordingOptions,
    recording,
    handleStartRecording,
    handleStopRecording,
    handleOpenEditor,
    handleCloseEditor,
    handleExportVideo,
    handlePlayProject,
    handleDeleteProject,
    handleExportProject,
    setRecordingOptions,
  } = useRecordingManager();

  const handleModeChange = (mode: AppMode) => {
    setCurrentMode(mode);
  };

  const handleOpenEditorAndSwitchMode = (project: any) => {
    handleOpenEditor(project);
    setCurrentMode('editing');
  };

  const handleCloseEditorAndSwitchMode = () => {
    handleCloseEditor();
    setCurrentMode('projects');
  };

  const handleExportVideoAndSwitchMode = (editedBlob: Blob, filename: string) => {
    handleExportVideo(editedBlob, filename);
    setCurrentMode('projects');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <AppHeader
          currentMode={currentMode}
          projectCount={projects.length}
          onModeChange={handleModeChange}
        />

        {/* Capture Mode */}
        {currentMode === 'capture' && (
          <CaptureMode
            stream={stream}
            isRecording={recording.isRecording}
            isPaused={recording.isPaused}
            duration={recording.duration}
            recordedBlob={recording.recordedBlob}
            recordingOptions={recordingOptions}
            onStartRecording={handleStartRecording}
            onPauseRecording={recording.pauseRecording}
            onResumeRecording={recording.resumeRecording}
            onStopRecording={() => {
              handleStopRecording();
              setCurrentMode('projects');
            }}
            onOptionsChange={setRecordingOptions}
          />
        )}

        {/* Projects Mode */}
        {currentMode === 'projects' && (
          <div className="max-w-6xl mx-auto">
            <ProjectManager
              projects={projects}
              onOpenEditor={handleOpenEditorAndSwitchMode}
              onPlayProject={handlePlayProject}
              onDeleteProject={handleDeleteProject}
              onExportProject={handleExportProject}
            />
          </div>
        )}

        {/* Editing Mode */}
        {currentMode === 'editing' && editingProject && (
          <div className="max-w-6xl mx-auto">
            <VideoEditor
              videoBlob={editingProject.blob}
              onExport={handleExportVideoAndSwitchMode}
              onClose={handleCloseEditorAndSwitchMode}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
