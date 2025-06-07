
import React, { useState } from 'react';
import { RecordingControls } from '../components/RecordingControls';
import { RecordingSettings } from '../components/RecordingSettings';
import { RecordingPreview } from '../components/RecordingPreview';
import { ProjectManager, RecordingProject } from '../components/ProjectManager';
import { VideoEditor } from '../components/VideoEditor';
import { useRecording } from '../hooks/useRecording';
import { RecordingOptions } from '../services/RecordingService';
import { useToast } from '@/hooks/use-toast';

type AppMode = 'capture' | 'projects' | 'editing';

const Index = () => {
  const { toast } = useToast();
  const recording = useRecording();
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [projects, setProjects] = useState<RecordingProject[]>([]);
  const [currentMode, setCurrentMode] = useState<AppMode>('capture');
  const [editingProject, setEditingProject] = useState<RecordingProject | null>(null);
  
  const [recordingOptions, setRecordingOptions] = useState<RecordingOptions>({
    includeAudio: true,
    includeWebcam: false,
    includeMicrophone: false,
    quality: 'medium',
    frameRate: 30,
  });

  const handleStartRecording = async () => {
    try {
      const recordingStream = await recording.startRecording(recordingOptions);
      setStream(recordingStream);
      setCurrentMode('capture');
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
      
      // Create new recording project
      const newProject: RecordingProject = {
        id: Date.now().toString(),
        name: `Recording ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        createdAt: new Date(),
        duration: recording.duration,
        size: blob.size,
        blob,
        status: 'captured',
      };
      
      setProjects(prev => [newProject, ...prev]);
      setCurrentMode('projects');
      
      toast({
        title: "Recording Captured",
        description: "Your recording has been saved. Ready for editing!",
      });
    } catch (error) {
      toast({
        title: "Capture Failed",
        description: "Unable to save recording.",
        variant: "destructive",
      });
    }
  };

  const handleOpenEditor = (project: RecordingProject) => {
    setEditingProject(project);
    setCurrentMode('editing');
    
    // Update project status
    setProjects(prev => 
      prev.map(p => 
        p.id === project.id 
          ? { ...p, status: 'editing' as const }
          : p
      )
    );
  };

  const handleCloseEditor = () => {
    setEditingProject(null);
    setCurrentMode('projects');
  };

  const handleExportVideo = (editedBlob: Blob, filename: string) => {
    if (!editingProject) return;
    
    // Update project with export info
    setProjects(prev => 
      prev.map(p => 
        p.id === editingProject.id 
          ? { 
              ...p, 
              status: 'exported' as const,
              exportedBlob: editedBlob,
              exportedFilename: filename
            }
          : p
      )
    );
    
    // Auto-download the exported video
    const url = URL.createObjectURL(editedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setCurrentMode('projects');
    setEditingProject(null);
  };

  const handlePlayProject = (project: RecordingProject) => {
    // Create a temporary preview window
    const url = URL.createObjectURL(project.blob);
    const video = document.createElement('video');
    video.src = url;
    video.controls = true;
    video.autoplay = true;
    video.style.width = '100%';
    video.style.height = '100%';
    
    const popup = window.open('', '_blank', 'width=800,height=600');
    if (popup) {
      popup.document.title = project.name;
      popup.document.body.style.margin = '0';
      popup.document.body.style.backgroundColor = '#000';
      popup.document.body.appendChild(video);
      
      popup.addEventListener('beforeunload', () => {
        URL.revokeObjectURL(url);
      });
    }
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Project Deleted",
      description: "Recording project has been removed.",
    });
  };

  const handleExportProject = (project: RecordingProject) => {
    if (project.exportedBlob && project.exportedFilename) {
      const url = URL.createObjectURL(project.exportedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = project.exportedFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: "Your exported video is being downloaded.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
            Screen Recorder Studio
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional screen recording with full editing capabilities: Capture → Save → Edit → Export
          </p>
          
          {/* Mode Navigation */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => setCurrentMode('capture')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentMode === 'capture' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              📹 Capture
            </button>
            <button
              onClick={() => setCurrentMode('projects')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentMode === 'projects' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              🎬 Projects ({projects.length})
            </button>
          </div>
        </div>

        {/* Capture Mode */}
        {currentMode === 'capture' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Recording Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Preview */}
              <RecordingPreview
                stream={stream}
                webcamStream={null}
                isRecording={recording.isRecording}
                recordedBlob={recording.recordedBlob}
                showWebcamOverlay={false}
                webcamOverlayPosition="bottom-right"
                webcamOverlaySize="medium"
                webcamOverlayShape="circle"
                onToggleWebcamOverlay={() => {}}
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
              />
            </div>

            {/* Settings Sidebar */}
            <div className="space-y-6">
              {/* Recording Settings */}
              <RecordingSettings
                options={recordingOptions}
                onChange={setRecordingOptions}
                disabled={recording.isRecording}
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
        )}

        {/* Projects Mode */}
        {currentMode === 'projects' && (
          <ProjectManager
            projects={projects}
            onOpenEditor={handleOpenEditor}
            onPlayProject={handlePlayProject}
            onDeleteProject={handleDeleteProject}
            onExportProject={handleExportProject}
          />
        )}

        {/* Editing Mode */}
        {currentMode === 'editing' && editingProject && (
          <VideoEditor
            videoBlob={editingProject.blob}
            onExport={handleExportVideo}
            onClose={handleCloseEditor}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
