
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { transcribeAudio } from '@/services/openAiService';

interface UseAudioRecordingProps {
  onTranscriptionComplete: (text: string) => void;
  onProcessingStateChange: (isProcessing: boolean) => void;
}

export const useAudioRecording = ({ 
  onTranscriptionComplete,
  onProcessingStateChange
}: UseAudioRecordingProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
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
          return;
        }
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('Recording stopped, audio blob size:', audioBlob.size);
        
        if (audioBlob.size < 100) {
          console.error('Audio blob too small, likely no audio recorded');
          toast.error('Upptaka of stutt. Reyndu aftur og talaðu nær hljóðnemanum.');
          onProcessingStateChange(false);
          return;
        }
        
        try {
          onProcessingStateChange(true);
          setTranscribedText('Vinsamlegast bíðið, er að vinna úr hljóðupptöku...');
          
          // Transcribe the audio
          const transcribedText = await transcribeAudio(audioBlob);
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
          }
        } catch (error) {
          console.error('Error processing audio:', error);
          toast.error('Villa við vinnslu hljóðupptöku. Reyndu aftur.');
          onProcessingStateChange(false);
        }
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
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
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      console.log('Stopping recording...');
      mediaRecorderRef.current.stop();
      setIsListening(false);
      
      toast.info('Hætt að hlusta', { 
        position: 'top-center', 
        duration: 2000 
      });
    }
  };

  const toggleRecording = () => {
    if (!isListening) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  return {
    isListening,
    transcribedText,
    toggleRecording
  };
};
