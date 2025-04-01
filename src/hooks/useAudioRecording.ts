
import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { transcribeAudio } from '@/services/openAiService';

interface UseAudioRecordingProps {
  onTranscriptionComplete: (text: string) => void;
  onProcessingStateChange: (isProcessing: boolean) => void;
  onTranscriptionError?: () => void;
  onAudioLevelChange?: (level: number) => void;
  autoDetectVoice?: boolean;
}

export const useAudioRecording = ({ 
  onTranscriptionComplete,
  onProcessingStateChange,
  onTranscriptionError,
  onAudioLevelChange,
  autoDetectVoice = false
}: UseAudioRecordingProps) => {
  const [isListening, setIsListening] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioDataRef = useRef<Uint8Array | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimeoutRef = useRef<number | null>(null);
  const silenceTimeoutRef = useRef<number | null>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const audioLevelIntervalRef = useRef<number | null>(null);
  const processingRef = useRef<boolean>(false);

  // Function to detect if user is speaking
  const detectSpeech = useCallback(() => {
    if (!analyserRef.current || !audioDataRef.current) return;
    
    analyserRef.current.getByteFrequencyData(audioDataRef.current);
    
    // Calculate average volume level
    const average = audioDataRef.current.reduce((sum, value) => sum + value, 0) / audioDataRef.current.length;
    
    // Normalize audio level between 0 and 1
    const normalizedLevel = Math.min(1, Math.max(0, average / 128));
    setAudioLevel(normalizedLevel);
    
    if (onAudioLevelChange) {
      onAudioLevelChange(normalizedLevel);
    }
    
    // Threshold for speech detection (adjust as needed)
    const threshold = 15;
    
    if (average > threshold && !isSpeakingRef.current && !isListening && !processingRef.current) {
      console.log('Speech detected, starting recording automatically');
      isSpeakingRef.current = true;
      startRecording();
    } else if (average <= threshold && isSpeakingRef.current && isListening) {
      // Set timeout to stop recording after 2 seconds of silence
      if (!silenceTimeoutRef.current) {
        silenceTimeoutRef.current = window.setTimeout(() => {
          console.log('Silence detected, stopping recording automatically');
          isSpeakingRef.current = false;
          stopRecording();
          silenceTimeoutRef.current = null;
        }, 2000) as unknown as number;
      }
    } else if (average > threshold && silenceTimeoutRef.current) {
      // If speech resumes, clear the silence timeout
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  }, [isListening, onAudioLevelChange]);

  // Initialize microphone access for voice detection
  const initializeVoiceDetection = useCallback(async () => {
    try {
      console.log('Requesting microphone access for voice detection');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create AudioContext for analyzing sound
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      audioDataRef.current = new Uint8Array(bufferLength);
      
      source.connect(analyserRef.current);
      
      // Set up continuous analysis
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current);
      }
      
      audioLevelIntervalRef.current = window.setInterval(() => {
        if (autoDetectVoice) {
          detectSpeech();
        } else if (isListening) {
          // Still update audio levels when manually recording
          if (analyserRef.current && audioDataRef.current) {
            analyserRef.current.getByteFrequencyData(audioDataRef.current);
            const average = audioDataRef.current.reduce((sum, value) => sum + value, 0) / audioDataRef.current.length;
            const normalizedLevel = Math.min(1, Math.max(0, average / 128));
            setAudioLevel(normalizedLevel);
            
            if (onAudioLevelChange) {
              onAudioLevelChange(normalizedLevel);
            }
          }
        }
      }, 100) as unknown as number;
      
      setHasPermission(true);
      
      // If autoDetectVoice is enabled, start analyzing immediately
      if (autoDetectVoice) {
        detectSpeech();
      }
      
    } catch (error) {
      console.error('Error accessing microphone for voice detection:', error);
      setHasPermission(false);
      toast.error('Ekki tókst að fá aðgang að hljóðnema fyrir raddgreiningu.');
    }
  }, [autoDetectVoice, detectSpeech, isListening, onAudioLevelChange]);

  useEffect(() => {
    initializeVoiceDetection();
    
    return () => {
      // Clean up resources
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [autoDetectVoice, initializeVoiceDetection]);

  const startRecording = useCallback(async () => {
    if (isListening || processingRef.current) return;
    
    try {
      console.log('Requesting microphone access');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      console.log('Microphone access granted, creating MediaRecorder');
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log(`Received audio chunk: ${event.data.size} bytes`);
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        processingRef.current = true;
        setIsListening(false);
        
        if (audioChunksRef.current.length === 0) {
          console.error('No audio data collected during recording');
          processingRef.current = false;
          if (onTranscriptionError) onTranscriptionError();
          return;
        }
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('Recording stopped, audio blob size:', audioBlob.size);
        
        if (audioBlob.size < 100) {
          console.error('Audio blob too small, likely no audio recorded');
          processingRef.current = false;
          if (onTranscriptionError) onTranscriptionError();
          return;
        }
        
        try {
          onProcessingStateChange(true);
          
          // Set a timeout in case transcription takes too long
          const transcriptionTimeout = setTimeout(() => {
            console.warn('Transcription taking longer than expected');
          }, 10000);
          
          // Transcribe the audio
          const transcribedText = await transcribeAudio(audioBlob);
          clearTimeout(transcriptionTimeout);
          
          console.log('Transcribed text:', transcribedText);
          
          if (transcribedText && transcribedText.trim()) {
            onTranscriptionComplete(transcribedText);
          } else {
            console.error('Empty transcription result');
            if (onTranscriptionError) onTranscriptionError();
          }
        } catch (error) {
          console.error('Error processing audio:', error);
          toast.error('Villa við vinnslu hljóðupptöku. Reyndu aftur.');
          if (onTranscriptionError) onTranscriptionError();
        } finally {
          onProcessingStateChange(false);
          processingRef.current = false;
        }
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Add a timeout to automatically stop recording after 15 seconds
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
      
      recordingTimeoutRef.current = window.setTimeout(() => {
        console.log('Recording timeout reached (15s), stopping automatically');
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          toast.info('Upptöku lokið sjálfkrafa eftir 15 sekúndur', {
            position: 'top-center',
            duration: 2000
          });
          stopRecording();
        }
      }, 15000) as unknown as number;
      
      // Start recording with a 1 second timeslice to get frequent ondataavailable events
      mediaRecorder.start(1000);
      setIsListening(true);
      
      toast.info('Ég er að hlusta...', { 
        position: 'top-center',
        duration: 2000
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Ekki tókst að hefja upptöku. Athugaðu að vefurinn hafi aðgang að hljóðnema.');
      if (onTranscriptionError) onTranscriptionError();
    }
  }, [isListening, onProcessingStateChange, onTranscriptionComplete, onTranscriptionError]);
  
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      console.log('Stopping recording...');
      mediaRecorderRef.current.stop();
      
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }
      
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
    }
  }, []);

  const toggleRecording = useCallback(() => {
    if (!isListening && !processingRef.current) {
      startRecording();
    } else if (isListening) {
      stopRecording();
    }
  }, [isListening, startRecording, stopRecording]);

  return {
    isListening,
    toggleRecording,
    startRecording,
    stopRecording,
    hasPermission,
    audioLevel
  };
};
