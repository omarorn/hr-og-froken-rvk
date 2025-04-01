
import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { transcribeAudio } from '@/services/openAiService';

interface UseAudioRecordingProps {
  onTranscriptionComplete: (text: string) => void;
  onProcessingStateChange: (isProcessing: boolean) => void;
  onTranscriptionError?: () => void;
}

export const useAudioRecording = ({ 
  onTranscriptionComplete,
  onProcessingStateChange,
  onTranscriptionError
}: UseAudioRecordingProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimeoutRef = useRef<number | null>(null);

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
    stopRecording
  };
};
