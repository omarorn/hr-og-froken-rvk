
import React, { ReactNode } from 'react';
import { ConversationScenario } from '@/services/chatService';

interface BackgroundContainerProps {
  children: ReactNode;
  currentScenario: string;
}

const BackgroundContainer: React.FC<BackgroundContainerProps> = ({
  children,
  currentScenario
}) => {
  // Get animated background class based on current scenario
  const getScenarioStyling = () => {
    switch (currentScenario) {
      case ConversationScenario.GREETING:
        return "bg-gradient-to-br from-iceland-blue/10 to-iceland-lightBlue/20";
      case ConversationScenario.HOLD:
        return "bg-gradient-to-br from-iceland-lightBlue/10 to-iceland-gray/10";
      case ConversationScenario.TECHNICAL_SUPPORT:
        return "bg-gradient-to-br from-iceland-lightBlue/10 to-iceland-red/5";
      case ConversationScenario.FOLLOW_UP:
        return "bg-gradient-to-br from-iceland-blue/10 to-iceland-green/10";
      case ConversationScenario.FAREWELL:
        return "bg-gradient-to-br from-iceland-darkBlue/10 to-iceland-blue/10";
      default:
        return "bg-gradient-to-b from-iceland-blue/10 to-iceland-lightBlue/20";
    }
  };

  return (
    <div className={`voice-assistant-container min-h-screen flex flex-col items-center p-4 md:p-8 transition-colors duration-1000 ${getScenarioStyling()}`}>
      {children}
    </div>
  );
};

export default BackgroundContainer;
