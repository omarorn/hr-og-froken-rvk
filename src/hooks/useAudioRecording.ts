
import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { transcribeAudio } from '@/services/openAiService';

interface UseAudioRecordingProps {
  onTranscriptionComplete: (text: string) => void;
  onProcessingStateChange: (isProcessing: boolean) => void;
  onTranscriptionError?: () => void;
  autoDetectVoice?: boolean;
}

export const useAudioRecording = ({ 
  onTranscriptionComplete,
  onProcessingStateChange,
  onTranscriptionError,
  autoDetectVoice = false
}: UseAudioRecordingProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioDataRef = useRef<Uint8Array | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimeoutRef = useRef<number | null>(null);
  const silenceTimeoutRef = useRef<number | null>(null);
  const isSpeakingRef = useRef<boolean>(false);

  // Function to detect if user is speaking
  const detectSpeech = useCallback(() => {
    if (!analyserRef.current || !audioDataRef.current) return;
    
    analyserRef.current.getByteFrequencyData(audioDataRef.current);
    
    // Calculate average volume level
    const average = audioDataRef.current.reduce((sum, value) => sum + value, 0) / audioDataRef.current.length;
    
    // Threshold for speech detection (adjust as needed)
    const threshold = 15;
    
    if (average > threshold && !isSpeakingRef.current && !isListening) {
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
  }, [isListening]);

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
      
      // Set up ongoing analysis
      const checkAudio = () => {
        if (autoDetectVoice) {
          detectSpeech();
        }
        requestAnimationFrame(checkAudio);
      };
      
      checkAudio();
      setHasPermission(true);
      
    } catch (error) {
      console.error('Error accessing microphone for voice detection:', error);
      setHasPermission(false);
      toast.error('Ekki tókst að fá aðgang að hljóðnema fyrir raddgreiningu.');
    }
  }, [autoDetectVoice, detectSpeech]);

  useEffect(() => {
    if (autoDetectVoice) {
      initializeVoiceDetection();
    }
    
    return () => {
      // Clean up resources
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [autoDetectVoice, initializeVoiceDetection]);

  const startRecording = useCallback(async () => {
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
        if (audioChunksRef.current.length === 0) {
          console.error('No audio data collected during recording');
          toast.error('Engin hljóðgögn söfnuðust. Reyndu aftur.');
          onProcessingStateChange(false);
          if (onTranscriptionError) onTranscriptionError();
          return;
        }
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('Recording stopped, audio blob size:', audioBlob.size);
        
        if (audioBlob.size < 100) {
          console.error('Audio blob too small, likely no audio recorded');
          toast.error('Upptaka of stutt. Reyndu aftur og talaðu nær hljóðnemanum.');
          onProcessingStateChange(false);
          if (onTranscriptionError) onTranscriptionError();
          return;
        }
        
        try {
          onProcessingStateChange(true);
          setTranscribedText('Vinsamlegast bíðið, er að vinna úr hljóðupptöku...');
          
          // Set a timeout in case transcription takes too long
          const transcriptionTimeout = setTimeout(() => {
            console.warn('Transcription taking longer than expected');
            setTranscribedText('Vinsamlegast bíðið, úrvinnsla tekur lengri tíma en búist var við...');
          }, 10000);
          
          // Transcribe the audio
          const transcribedText = await transcribeAudio(audioBlob);
          clearTimeout(transcriptionTimeout);
          
          console.log('Transcribed text:', transcribedText);
          
          // Save the transcribed text
          setTranscribedText(transcribedText);
          
          if (transcribedText && transcribedText.trim()) {
            onTranscriptionComplete(transcribedText);
          } else {
            console.error('Empty transcription result');
            toast.info('Ekkert tal greindist. Reyndu aftur.', { 
              position: 'top-center',
              duration: 2000
            });
            onProcessingStateChange(false);
            if (onTranscriptionError) onTranscriptionError();
          }
        } catch (error) {
          console.error('Error processing audio:', error);
          toast.error('Villa við vinnslu hljóðupptöku. Reyndu aftur.');
          onProcessingStateChange(false);
          if (onTranscriptionError) onTranscriptionError();
        }
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Add a timeout to automatically stop recording after 30 seconds
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
      
      recordingTimeoutRef.current = window.setTimeout(() => {
        console.log('Recording timeout reached (30s), stopping automatically');
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          toast.info('Upptöku lokið sjálfkrafa eftir 30 sekúndur', {
            position: 'top-center',
            duration: 2000
          });
          stopRecording();
        }
      }, 30000) as unknown as number;
      
      // Start recording with a 10 second timeslice to get frequent ondataavailable events
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
  }, [onProcessingStateChange, onTranscriptionComplete, onTranscriptionError]);
  
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      console.log('Stopping recording...');
      mediaRecorderRef.current.stop();
      setIsListening(false);
      
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }
      
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      
      toast.info('Hætt að hlusta', { 
        position: 'top-center', 
        duration: 2000 
      });
    }
  }, []);

  const toggleRecording = useCallback(() => {
    if (!isListening) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [isListening, startRecording, stopRecording]);

  return {
    isListening,
    transcribedText,
    toggleRecording,
    startRecording,
    stopRecording,
    hasPermission
  };
};
