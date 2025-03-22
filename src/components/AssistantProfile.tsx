
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VoiceVisualizer from './VoiceVisualizer';

interface AssistantProfileProps {
  name: string;
  isActive: boolean;
  gender: 'female' | 'male';
}

const AssistantProfile: React.FC<AssistantProfileProps> = ({ 
  name, 
  isActive,
  gender
}) => {
  return (
    <div className="flex flex-col items-center space-y-3 p-4">
      <Avatar className="h-24 w-24 border-2 border-iceland-blue shadow-md">
        <AvatarImage 
          src={gender === 'female' ? "/rosa-avatar.png" : "/birkir-avatar.png"} 
          alt={name} 
        />
        <AvatarFallback className="bg-iceland-blue text-white text-xl">
          {name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="text-center">
        <h2 className="text-xl font-medium text-iceland-darkBlue">{name}</h2>
        <p className="text-sm text-iceland-darkGray">Reykjavíkurborg</p>
      </div>
      <VoiceVisualizer isActive={isActive} />
    </div>
  );
};

export default AssistantProfile;
