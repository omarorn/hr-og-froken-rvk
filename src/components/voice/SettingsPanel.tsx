
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SettingsPanelProps {
  autoDetectVoice: boolean;
  toggleAutoDetectVoice: () => void;
  showVideoChat: boolean;
  toggleVideoChat: () => void;
  showSubtitles: boolean;
  toggleSubtitles: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  autoDetectVoice,
  toggleAutoDetectVoice,
  showVideoChat,
  toggleVideoChat,
  showSubtitles,
  toggleSubtitles
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <Label htmlFor="voice-detection-toggle" className="text-sm">
          Sjálfvirk raddgreining
        </Label>
        <Switch 
          id="voice-detection-toggle" 
          checked={autoDetectVoice}
          onCheckedChange={toggleAutoDetectVoice}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Label htmlFor="video-toggle" className="text-sm">
          Myndavél
        </Label>
        <Switch 
          id="video-toggle" 
          checked={showVideoChat}
          onCheckedChange={toggleVideoChat}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Label htmlFor="subtitle-toggle" className="text-sm">
          Skjátextar
        </Label>
        <Switch 
          id="subtitle-toggle" 
          checked={showSubtitles}
          onCheckedChange={toggleSubtitles}
        />
      </div>
    </div>
  );
};

export default SettingsPanel;
