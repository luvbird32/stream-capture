
import React from 'react';

type AppMode = 'capture' | 'projects' | 'editing';

interface AppHeaderProps {
  currentMode: AppMode;
  projectCount: number;
  onModeChange: (mode: AppMode) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentMode,
  projectCount,
  onModeChange,
}) => {
  return (
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
          onClick={() => onModeChange('capture')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            currentMode === 'capture' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          📹 Capture
        </button>
        <button
          onClick={() => onModeChange('projects')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            currentMode === 'projects' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          🎬 Projects ({projectCount})
        </button>
      </div>
    </div>
  );
};
