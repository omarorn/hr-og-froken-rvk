
import React, { useState, useEffect, useRef } from 'react';
import VoiceButton from './VoiceButton';
import MessageBubble from './MessageBubble';
import AssistantProfile from './AssistantProfile';
import { toast } from 'sonner';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ApiKeyModal from './ApiKeyModal';
import { getTextToSpeech, transcribeAudio } from '@/services/openAiService';
import VoiceVisualizer from './VoiceVisualizer';

interface Message {
  text: string;
  isUser: boolean;
  id: number;
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
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
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
        id: Date.now()
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
    if (message.isUser || !localStorage.getItem('openai_api_key')) return;
    
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
      
      if ((error as Error).message.includes('API key')) {
        toast.error('Þú þarft að setja inn OpenAI API lykil', {
          action: {
            label: 'Setja',
            onClick: () => setIsApiKeyModalOpen(true)
          }
        });
      } else {
        toast.error('Villa við afspilun á rödd. Reyndu aftur.');
      }
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
          
          if ((error as Error).message.includes('API key')) {
            toast.error('Þú þarft að setja inn OpenAI API lykil', {
              action: {
                label: 'Setja',
                onClick: () => setIsApiKeyModalOpen(true)
              }
            });
          }
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

  const handleUserResponse = (userQuestion: string) => {
    setTimeout(() => {
      // Generate response based on the user's question
      let response = "";
      
      if (userQuestion.toLowerCase().includes("leikskóla")) {
        response = "Þú getur sótt um leikskólapláss á vef Reykjavíkurborgar. Farðu á reykjavik.is og undir 'Þjónusta' finnur þú 'Skólar og frístund' þar sem þú getur sótt um leikskólapláss. Þú þarft að vera með rafræn skilríki eða Íslykil til að skrá þig inn. Get ég aðstoðað þig með eitthvað annað?";
      } else if (userQuestion.toLowerCase().includes("sorp")) {
        response = "Upplýsingar um sorpflokkun eru á vef Reykjavíkurborgar undir 'Þjónusta' og þá 'Sorphirða og flokkun'. Þar finnur þú ítarlegar leiðbeiningar um flokkun og losunarstaði. Einnig er hægt að sækja appið Borgin mín Reykjavík þar sem þú getur fengið upplýsingar um sorphirðudaga í þínu hverfi. Er eitthvað annað sem ég get hjálpað þér með?";
      } else if (userQuestion.toLowerCase().includes("borgarstjór")) {
        response = "Næsti fundur borgarstjórnar er á þriðjudaginn næsta klukkan 14:00 í Ráðhúsi Reykjavíkur. Þú getur fylgst með fundinum í beinni útsendingu á vef Reykjavíkurborgar. Fundarboð og dagskrá er einnig hægt að nálgast á vefnum undir 'Stjórnkerfi' og 'Fundir og fundargerðir'. Get ég veitt þér frekari upplýsingar?";
      } else if (userQuestion.toLowerCase().includes("fasteignagjöld")) {
        response = "Þú getur greitt fasteignagjöld á vef Reykjavíkurborgar. Farðu á reykjavik.is og undir 'Þjónusta' finnur þú 'Fjármál og gjöld' þar sem þú getur greitt fasteignagjöld með rafrænum hætti. Þú þarft að vera með rafræn skilríki eða Íslykil til að skrá þig inn. Einnig er hægt að greiða í heimabanka eða í afgreiðslu Þjónustuvers Reykjavíkurborgar. Er eitthvað fleira sem ég get hjálpað þér með?";
      } else if (userQuestion.toLowerCase().includes("sundlaug")) {
        response = "Opnunartímar sundlauga í Reykjavík eru mismunandi eftir sundlaugum og árstíðum. Almennt eru sundlaugar opnar frá kl. 6:30 til 22:00 virka daga og frá 8:00 til 20:00 um helgar. Þú getur séð nákvæma opnunartíma hverrar sundlaugar á vef Reykjavíkurborgar undir 'Íþróttir og útivist' og svo 'Sundlaugar'. Þar finnur þú einnig upplýsingar um aðgangsverð og aðstöðu. Get ég aðstoðað þig með eitthvað annað?";
      } else {
        response = "Takk fyrir fyrirspurnina. Ég get veitt þér upplýsingar um margvíslega þjónustu Reykjavíkurborgar, svo sem leikskóla, grunnskóla, íþróttir og tómstundir, skipulagsmál, sorphirðu, og margt fleira. Hvernig get ég aðstoðað þig nánar?";
      }
      
      // Add assistant response
      const assistantMessage = {
        text: response,
        isUser: false,
        id: Date.now()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
      
      // Speak the response
      speakMessage(assistantMessage);
    }, 1000);
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
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsApiKeyModalOpen(true)}
            title="Stillingar"
          >
            <Settings className="h-5 w-5 text-iceland-darkGray" />
          </Button>
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
        
        <div className="p-6 border-t border-iceland-blue/10 flex justify-center">
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
      
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen} 
        onClose={() => setIsApiKeyModalOpen(false)} 
      />
    </div>
  );
};

export default VoiceAssistant;
