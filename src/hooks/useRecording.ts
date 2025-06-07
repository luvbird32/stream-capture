import { useState, useRef, useCallback, useEffect } from 'react';
import { RecordingService, RecordingOptions, RecordingState } from '../services/RecordingService';

export const useRecording = () => {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    recordedBlob: null,
  });

  const recordingService = useRef(new RecordingService());
  const intervalRef = useRef<NodeJS.Timeout>();

  const startRecording = useCallback(async (options: RecordingOptions): Promise<MediaStream> => {
    try {
      const stream = await recordingService.current.startRecording(options);
      setState(prev => ({ ...prev, isRecording: true, isPaused: false }));
      
      // Start duration timer
      intervalRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          duration: recordingService.current.getDuration()
        }));
      }, 100);
      
      return stream;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }, []);

  const pauseRecording = useCallback(() => {
    recordingService.current.pauseRecording();
    setState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resumeRecording = useCallback(() => {
    recordingService.current.resumeRecording();
    setState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      const blob = await recordingService.current.stopRecording();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setState(prev => ({
        ...prev,
        isRecording: false,
        isPaused: false,
        recordedBlob: blob,
        duration: 0
      }));
      return blob;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  };
};
