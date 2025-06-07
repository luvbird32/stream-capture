
import { useState } from 'react';
import { useRecording } from './useRecording';
import { RecordingProject } from '../components/ProjectManager';
import { RecordingOptions } from '../services/RecordingService';
import { useToast } from '@/hooks/use-toast';

export const useRecordingManager = () => {
  const { toast } = useToast();
  const recording = useRecording();
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [projects, setProjects] = useState<RecordingProject[]>([]);
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

  return {
    // State
    stream,
    projects,
    editingProject,
    recordingOptions,
    recording,
    
    // Handlers
    handleStartRecording,
    handleStopRecording,
    handleOpenEditor,
    handleCloseEditor,
    handleExportVideo,
    handlePlayProject,
    handleDeleteProject,
    handleExportProject,
    setRecordingOptions,
  };
};
