
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
  const streamRef = useRef<MediaStream | null>(null);
  const isStoppingRef = useRef(false);

  const startRecording = useCallback(async (options: RecordingOptions): Promise<MediaStream> => {
    try {
      if (state.isRecording) {
        throw new Error('Recording already in progress');
      }

      console.log('Starting recording with options:', options);
      const { screenStream } = await recordingService.current.startRecording(options);
      
      // Store the stream reference
      streamRef.current = screenStream;
      
      // Listen for when the screen share ends
      screenStream.getVideoTracks().forEach(track => {
        track.addEventListener('ended', () => {
          console.log('Screen sharing ended, stopping recording automatically');
          if (!isStoppingRef.current) {
            stopRecording().catch(console.error);
          }
        });
      });
      
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
      // Reset state on error
      setState(prev => ({
        ...prev,
        isRecording: false,
        isPaused: false,
      }));
      throw error;
    }
  }, [state.isRecording]);

  const pauseRecording = useCallback(() => {
    if (!state.isRecording || state.isPaused) {
      console.warn('Cannot pause: not recording or already paused');
      return;
    }
    console.log('Pausing recording');
    recordingService.current.pauseRecording();
    setState(prev => ({ ...prev, isPaused: true }));
  }, [state.isRecording, state.isPaused]);

  const resumeRecording = useCallback(() => {
    if (!state.isRecording || !state.isPaused) {
      console.warn('Cannot resume: not recording or not paused');
      return;
    }
    console.log('Resuming recording');
    recordingService.current.resumeRecording();
    setState(prev => ({ ...prev, isPaused: false }));
  }, [state.isRecording, state.isPaused]);

  const stopRecording = useCallback(async () => {
    try {
      if (!state.isRecording || isStoppingRef.current) {
        console.warn('No recording to stop or already stopping');
        return null;
      }

      isStoppingRef.current = true;
      console.log('Stopping recording - current state:', state.isRecording);
      
      // Clear the interval first
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      
      // Clear stream reference
      streamRef.current = null;
      
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
      
      // Clear stream reference
      streamRef.current = null;
      
      throw error;
    } finally {
      isStoppingRef.current = false;
    }
  }, [state.isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Force cleanup if component unmounts during recording
      if (state.isRecording) {
        recordingService.current.stopRecording().catch(console.error);
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
