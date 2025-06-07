
import { useState } from 'react';
import { useRecording } from './useRecording';
import { RecordingProject } from '../components/ProjectManager';
import { RecordingOptions } from '../services/RecordingService';
import { useToast } from '@/hooks/use-toast';
import { SecurityUtils } from '../lib/security';

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
      
      // Validate blob size for security
      if (!SecurityUtils.validateBlobSize(blob)) {
        toast({
          title: "Recording Too Large",
          description: "The recording file exceeds the maximum allowed size. Please try a shorter recording.",
          variant: "destructive",
        });
        return;
      }
      
      // Create new recording project with sanitized name
      const timestamp = new Date();
      const baseName = `Recording ${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString()}`;
      const sanitizedName = SecurityUtils.sanitizeProjectName(baseName);
      
      const newProject: RecordingProject = {
        id: Date.now().toString(),
        name: sanitizedName,
        createdAt: timestamp,
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
    
    // Validate and sanitize filename
    const sanitizedFilename = SecurityUtils.validateFilename(filename) 
      ? filename 
      : SecurityUtils.generateSecureFilename('exported-recording', 'webm');
    
    // Validate blob size
    if (!SecurityUtils.validateBlobSize(editedBlob)) {
      toast({
        title: "Export Failed",
        description: "The exported file is too large.",
        variant: "destructive",
      });
      return;
    }
    
    // Update project with export info
    setProjects(prev => 
      prev.map(p => 
        p.id === editingProject.id 
          ? { 
              ...p, 
              status: 'exported' as const,
              exportedBlob: editedBlob,
              exportedFilename: sanitizedFilename
            }
          : p
      )
    );
    
    // Auto-download the exported video
    const url = URL.createObjectURL(editedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = sanitizedFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setEditingProject(null);
  };

  const handlePlayProject = (project: RecordingProject) => {
    // Validate blob before creating URL
    if (!SecurityUtils.validateBlobSize(project.blob)) {
      toast({
        title: "Playback Failed",
        description: "The video file is too large to play.",
        variant: "destructive",
      });
      return;
    }
    
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
      const sanitizedTitle = SecurityUtils.sanitizeTextInput(project.name, 100);
      popup.document.title = sanitizedTitle;
      popup.document.body.style.margin = '0';
      popup.document.body.style.backgroundColor = '#000';
      popup.document.body.appendChild(video);
      
      popup.addEventListener('beforeunload', () => {
        URL.revokeObjectURL(url);
      });
    }
  };

  const handleDeleteProject = (id: string) => {
    // Find the project to cleanup its blob URL
    const projectToDelete = projects.find(p => p.id === id);
    if (projectToDelete) {
      // Cleanup blob URLs to prevent memory leaks
      if (projectToDelete.blob) {
        URL.revokeObjectURL(URL.createObjectURL(projectToDelete.blob));
      }
      if (projectToDelete.exportedBlob) {
        URL.revokeObjectURL(URL.createObjectURL(projectToDelete.exportedBlob));
      }
    }
    
    setProjects(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Project Deleted",
      description: "Recording project has been removed.",
    });
  };

  const handleExportProject = (project: RecordingProject) => {
    if (project.exportedBlob && project.exportedFilename) {
      // Validate filename before export
      const filename = SecurityUtils.validateFilename(project.exportedFilename)
        ? project.exportedFilename
        : SecurityUtils.generateSecureFilename('exported-recording', 'webm');
      
      const url = URL.createObjectURL(project.exportedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
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
