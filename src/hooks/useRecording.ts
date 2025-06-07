import { useState, useRef, useCallback, useEffect } from 'react';
import { RecordingService, RecordingOptions, RecordingState } from '../services/RecordingService';

interface ExtendedRecordingState extends RecordingState {
  webcamStream: MediaStream | null;
}

export const useRecording = () => {
  const [state, setState] = useState<ExtendedRecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    recordedBlob: null,
    webcamStream: null,
  });

  const recordingService = useRef(new RecordingService());
  const intervalRef = useRef<NodeJS.Timeout>();

  const startRecording = useCallback(async (options: RecordingOptions): Promise<MediaStream> => {
    try {
      const { screenStream, webcamStream } = await recordingService.current.startRecording(options);
      setState(prev => ({ 
        ...prev, 
        isRecording: true, 
        isPaused: false,
        webcamStream: webcamStream || null
      }));
      
      // Start duration timer
      intervalRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          duration: recordingService.current.getDuration()
        }));
      }, 100);
      
      return screenStream;
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
        duration: 0,
        webcamStream: null
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
    pauseRecording: recordingService.current.pauseRecording?.bind(recordingService.current),
    resumeRecording: recordingService.current.resumeRecording?.bind(recordingService.current),
    stopRecording,
  };
};
