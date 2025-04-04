
import React, { useState, useEffect } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Languages } from 'lucide-react';
import { ConversationScenario } from '@/services/chatService';

interface MessageSubtitlesProps {
  text: string;
  isActive: boolean;
  scenario?: string;
}

const MessageSubtitles: React.FC<MessageSubtitlesProps> = ({ 
  text, 
  isActive,
  scenario = ConversationScenario.GENERAL
}) => {
  const [language, setLanguage] = useState<string>("is");
  const [translatedText, setTranslatedText] = useState<string>(text);
  
  const languages = [
    { code: "is", name: "Íslenska" },
    { code: "en", name: "English" },
    { code: "pl", name: "Polski" },
    { code: "lt", name: "Lietuvių" },
    { code: "dk", name: "Dansk" },
    { code: "no", name: "Norsk" },
    { code: "sv", name: "Svenska" },
  ];
  
  // For now, this is a placeholder. In a real implementation, 
  // this would connect to a translation API
  useEffect(() => {
    if (language === "is") {
      setTranslatedText(text);
    } else {
      // In a real implementation, this would be replaced with an API call
      // For demo purposes, we'll just add a language tag
      setTranslatedText(`[${language.toUpperCase()}] ${text}`);
    }
  }, [text, language]);
  
  // Get container styling based on scenario
  const getSubtitleStyling = () => {
    const baseStyles = "p-3 rounded-lg max-w-3xl mx-auto backdrop-blur-sm shadow-lg subtitle-box pointer-events-auto";
    
    switch (scenario) {
      case ConversationScenario.GREETING:
        return `${baseStyles} bg-black/80 text-white`;
      case ConversationScenario.HOLD:
        return `${baseStyles} bg-gray-800/85 text-white`;
      case ConversationScenario.TECHNICAL_SUPPORT:
        return `${baseStyles} bg-gray-900/85 text-white`;
      case ConversationScenario.FOLLOW_UP:
        return `${baseStyles} bg-black/85 text-white`;
      case ConversationScenario.FAREWELL:
        return `${baseStyles} bg-gray-800/80 text-white`;
      default:
        return `${baseStyles} bg-black/80 text-white`;
    }
  };

  // Get animation progress color based on scenario
  const getProgressColor = () => {
    switch (scenario) {
      case ConversationScenario.GREETING:
        return "bg-blue-500";
      case ConversationScenario.HOLD:
        return "bg-gray-400";
      case ConversationScenario.TECHNICAL_SUPPORT:
        return "bg-red-500";
      case ConversationScenario.FOLLOW_UP:
        return "bg-green-500";
      case ConversationScenario.FAREWELL:
        return "bg-indigo-500";
      default:
        return "bg-blue-500";
    }
  };
  
  if (!isActive) return null;
  
  return (
    <div className="subtitle-container fixed bottom-0 left-0 right-0 p-4 flex justify-center items-center z-20 pointer-events-none">
      <div className={getSubtitleStyling()}>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-xs uppercase tracking-wider font-mono">LIVE</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Languages size={16} />
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="h-7 w-28 bg-transparent border-gray-600 text-white text-xs">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code} className="text-sm">
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <p className="text-center text-lg font-medium tracking-wide font-mono leading-relaxed">
          {translatedText}
        </p>
        
        <div className="h-1 w-full bg-gray-700 mt-2 rounded overflow-hidden">
          <div className={`h-full ${getProgressColor()} rounded animate-[subtitleProgress_4s_ease-in-out_infinite]`}></div>
        </div>
      </div>
    </div>
  );
};

export default MessageSubtitles;
