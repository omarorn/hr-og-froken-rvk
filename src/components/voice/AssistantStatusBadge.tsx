
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AssistantStatusBadgeProps {
  assistantId?: string;
  threadId?: string;
  initError?: boolean;
  onReconnect: () => Promise<void>;
}

const AssistantStatusBadge: React.FC<AssistantStatusBadgeProps> = ({
  assistantId,
  threadId,
  initError,
  onReconnect
}) => {
  if (assistantId && threadId) {
    return (
      <div className="fixed bottom-2 right-2 z-50">
        <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300 hover:bg-green-100">
          OpenAI Assistant API
        </Badge>
      </div>
    );
  } else if (initError) {
    return (
      <div className="fixed bottom-2 right-2 z-50 flex items-center space-x-2">
        <Badge variant="outline" className="bg-red-50 text-red-800 border-red-300 hover:bg-red-100">
          Staðbundinn aðstoðarmaður
        </Badge>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white/80 border-red-300 text-red-800 hover:bg-red-50"
          onClick={onReconnect}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Reyna aftur
        </Button>
      </div>
    );
  }
  return null;
};

export default AssistantStatusBadge;

