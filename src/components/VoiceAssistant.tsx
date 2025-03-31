
import React, { useState, useEffect, useRef } from 'react';
import VoiceButton from './VoiceButton';
import MessageBubble from './MessageBubble';
import AssistantProfile from './AssistantProfile';
import { toast } from 'sonner';
import { getTextToSpeech, transcribeAudio } from '@/services/openAiService';
import { sendChatMessage } from '@/services/chatService';
import VoiceVisualizer from './VoiceVisualizer';

interface Message {
  text: string;
  isUser: boolean;
  id: number;
  gender?: 'female' | 'male';
}

interface VoiceAssistantProps {
  assistantName?: string;
  gender?: 'female' | 'male';
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ 
  assistantName = 'Rósa', 
  gender = 'female' 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Initial greeting when component mounts
  useEffect(() => {
    const initialGreeting = gender === 'female' 
      ? "Góðan dag, ég heiti Rósa. Hvernig get ég aðstoðað þig í dag?"
      : "Góðan dag, ég heiti Birkir. Hvernig get ég aðstoðað þig í dag?";
    
    // Add initial message with slight delay to create a natural feel
    setTimeout(() => {
      const newMessage = {
        text: initialGreeting,
        isUser: false,
        id: Date.now(),
        gender
      };
      
      setMessages([newMessage]);
      
      // Try to speak the greeting
      speakMessage(newMessage);
    }, 1000);
  }, [gender]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakMessage = async (message: Message) => {
    if (message.isUser) return;
    
    try {
      setIsSpeaking(true);
      
      // Select voice based on gender
      const voice = gender === 'female' ? 'nova' : 'echo';
      
      // Instructions for Icelandic pronunciation
      const instructions = "The voice should speak with a clear Icelandic accent and pronounce Icelandic characters like þ, ð, æ, etc. correctly. The tone should be warm and helpful, like a friendly customer service representative.";
      
      const audioData = await getTextToSpeech(message.text, voice, instructions);
      const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        audioRef.current.play().catch(error => {
          console.error('Audio playback error:', error);
          setIsSpeaking(false);
        });
      }
    } catch (error) {
      console.error('Failed to speak message:', error);
      setIsSpeaking(false);
      toast.error('Villa við afspilun á rödd. Reyndu aftur.');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        try {
          setIsProcessing(true);
          
          // Transcribe the audio
          const transcribedText = await transcribeAudio(audioBlob);
          setTranscribedText(transcribedText); // Save the transcribed text
          
          if (transcribedText.trim()) {
            // Add user message
            const userMessage = {
              text: transcribedText,
              isUser: true,
              id: Date.now()
            };
            
            setMessages(prev => [...prev, userMessage]);
            handleUserResponse(transcribedText);
          } else {
            toast.info('Ekkert tal greindist. Reyndu aftur.', { 
              position: 'top-center',
              duration: 2000
            });
            setIsProcessing(false);
          }
        } catch (error) {
          console.error('Error processing audio:', error);
          toast.error('Villa við vinnslu hljóðupptöku. Reyndu aftur.');
          setIsProcessing(false);
        }
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
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
      mediaRecorderRef.current.stop();
      setIsListening(false);
      
      toast.info('Hætt að hlusta', { 
        position: 'top-center', 
        duration: 2000 
      });
    }
  };

  const toggleListening = () => {
    if (!isListening && !isProcessing) {
      startRecording();
    } else if (isListening) {
      stopRecording();
    }
  };

  const handleUserResponse = async (userQuestion: string) => {
    try {
      // Get conversation history to provide context to the AI
      const conversationHistory = messages.map(msg => ({
        text: msg.text,
        isUser: msg.isUser,
        gender: gender
      }));
      
      // Send the message to OpenAI
      const response = await sendChatMessage(userQuestion, conversationHistory);
      
      // Add assistant response
      const assistantMessage = {
        text: response.text,
        isUser: false,
        id: Date.now()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
      
      // Speak the response
      speakMessage(assistantMessage);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setIsProcessing(false);
      toast.error('Villa við að sækja svar. Reyndu aftur.');
    }
  };

  return (
    <div className="voice-assistant-container min-h-screen flex flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-2xl bg-white/70 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-iceland-blue/20">
        <div className="p-6 border-b border-iceland-blue/10 flex justify-between items-center">
          <AssistantProfile 
            name={assistantName} 
            isActive={isSpeaking}
            gender={gender}
          />
          
          {/* Transcription display */}
          {transcribedText && (
            <div className="text-sm text-iceland-darkGray mt-2 flex items-center">
              <span className="font-medium mr-1">Uppritað:</span>
              <div className="italic">{transcribedText}</div>
            </div>
          )}
        </div>
        
        <div className="h-96 md:h-[420px] overflow-y-auto p-6 space-y-4 bg-iceland-gray/30">
          {messages.map((message) => (
            <MessageBubble 
              key={message.id}
              message={message.text}
              isUser={message.isUser}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-6 border-t border-iceland-blue/10 flex flex-col items-center">
          {/* Show transcribed text above the voice button */}
          {isProcessing && transcribedText && (
            <div className="mb-4 text-center">
              <div className="text-sm font-medium text-iceland-darkGray">Uppritaður texti:</div>
              <div className="text-iceland-darkBlue italic">{transcribedText}</div>
            </div>
          )}
          
          <div className="flex items-center">
            {isSpeaking && (
              <div className="mr-4">
                <VoiceVisualizer isActive={isSpeaking} />
              </div>
            )}
            <VoiceButton 
              isListening={isListening} 
              isProcessing={isProcessing}
              onClick={toggleListening} 
            />
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-iceland-darkGray">
        <p>Reykjavíkurborg Digital Assistant</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} Reykjavíkurborg - Öll réttindi áskilin</p>
      </div>
    </div>
  );
};

export default VoiceAssistant;
