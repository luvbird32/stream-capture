
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
      console.log('Starting recording with options:', options);
      const { screenStream } = await recordingService.current.startRecording(options);
      
      setState(prev => ({ 
        ...prev, 
        isRecording: true, 
        isPaused: false,
        recordedBlob: null,
      }));
      
      // Start duration timer
      intervalRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          duration: recordingService.current.getDuration()
        }));
      }, 100);
      
      console.log('Recording started successfully');
      return screenStream;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }, []);

  const pauseRecording = useCallback(() => {
    console.log('Pausing recording');
    recordingService.current.pauseRecording();
    setState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resumeRecording = useCallback(() => {
    console.log('Resuming recording');
    recordingService.current.resumeRecording();
    setState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      console.log('Stopping recording - current state:', state.isRecording);
      
      // Clear the interval first
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      
      // Stop the recording service
      const blob = await recordingService.current.stopRecording();
      console.log('Recording service stopped, blob received:', blob.size);
      
      // Update state
      setState(prev => ({
        ...prev,
        isRecording: false,
        isPaused: false,
        recordedBlob: blob,
        duration: recordingService.current.getDuration(),
      }));
      
      console.log('Recording stopped successfully, blob size:', blob.size);
      return blob;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      
      // Ensure we reset state even if there's an error
      setState(prev => ({
        ...prev,
        isRecording: false,
        isPaused: false,
      }));
      
      // Clear interval on error too
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      
      throw error;
    }
  }, [state.isRecording]);

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
    webcamStream: null,
  };
};
