
import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import { Message } from '@/services/messageService';

interface ConversationHistoryProps {
  messages: Message[];
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add empty state when no messages
  if (messages.length === 0) {
    return (
      <div className="h-96 md:h-[420px] overflow-y-auto p-6 flex items-center justify-center bg-iceland-gray/30">
        <div className="text-iceland-darkGray text-center">
          <p className="text-lg font-medium">Engar skilaboð ennþá</p>
          <p className="text-sm">Smelltu á takkann til að tala við aðstoðarmanninn</p>
        </div>
      </div>
    );
  }

  return (
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
  );
};

export default ConversationHistory;
