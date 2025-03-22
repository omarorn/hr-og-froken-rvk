
import React from 'react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  className?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isUser, 
  className 
}) => {
  return (
    <div 
      className={cn(
        "message-bubble max-w-[80%] p-4 rounded-2xl shadow-sm animate-slide-up",
        isUser 
          ? "user-message bg-iceland-lightBlue ml-auto" 
          : "assistant-message bg-white mr-auto",
        className
      )}
    >
      <p className="text-iceland-darkBlue">{message}</p>
    </div>
  );
};

export default MessageBubble;
