
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, Play, Edit, Trash2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface RecordingProject {
  id: string;
  name: string;
  createdAt: Date;
  duration: number;
  size: number;
  blob: Blob;
  status: 'captured' | 'editing' | 'exported';
  exportedBlob?: Blob;
  exportedFilename?: string;
}

interface ProjectManagerProps {
  projects: RecordingProject[];
  onOpenEditor: (project: RecordingProject) => void;
  onPlayProject: (project: RecordingProject) => void;
  onDeleteProject: (id: string) => void;
  onExportProject: (project: RecordingProject) => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  projects,
  onOpenEditor,
  onPlayProject,
  onDeleteProject,
  onExportProject,
}) => {
  const { toast } = useToast();

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: RecordingProject['status']) => {
    switch (status) {
      case 'captured':
        return 'bg-blue-500';
      case 'editing':
        return 'bg-yellow-500';
      case 'exported':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: RecordingProject['status']) => {
    switch (status) {
      case 'captured':
        return 'Ready to Edit';
      case 'editing':
        return 'In Progress';
      case 'exported':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <FolderOpen className="w-5 h-5" />
          Recording Projects
        </CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-4">🎬</div>
            <p>No recording projects yet</p>
            <p className="text-sm">Capture your first recording to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">{project.name}</h4>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                    <Badge variant="outline" className="text-xs">
                      {getStatusText(project.status)}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {formatDuration(project.duration)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {formatFileSize(project.size)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {project.createdAt.toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPlayProject(project)}
                    title="Preview"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOpenEditor(project)}
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  {project.status === 'exported' && (
                    <Button
                      size="sm"
                      onClick={() => onExportProject(project)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDeleteProject(project.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
