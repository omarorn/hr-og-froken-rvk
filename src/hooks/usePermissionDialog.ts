
import { useState } from 'react';
import { toast } from 'sonner';

interface UsePermissionDialogProps {
  initializeVoiceDetection: () => Promise<void>;
}

export const usePermissionDialog = ({ initializeVoiceDetection }: UsePermissionDialogProps) => {
  const [showPermissionDialog, setShowPermissionDialog] = useState<boolean>(false);
  const [autoDetectVoice, setAutoDetectVoice] = useState<boolean>(false);
  
  const toggleAutoDetectVoice = async () => {
    if (!autoDetectVoice) {
      // Show permission dialog when enabling voice detection
      setShowPermissionDialog(true);
    } else {
      setAutoDetectVoice(false);
      toast.info('Sjálfvirk raddgreining óvirk.', { duration: 2000 });
    }
  };

  const requestMicrophoneAccess = async () => {
    try {
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Initialize voice detection with the granted permission
      await initializeVoiceDetection();
      
      setAutoDetectVoice(true);
      setShowPermissionDialog(false);
      
      toast.success('Sjálfvirk raddgreining virkjuð.', { duration: 3000 });
    } catch (error) {
      console.error('Error requesting microphone access:', error);
      toast.error('Ekki tókst að fá aðgang að hljóðnema. Virkjaðu hljóðnemann í stillingum vafrans.');
      setAutoDetectVoice(false);
      setShowPermissionDialog(false);
    }
  };

  return {
    showPermissionDialog,
    setShowPermissionDialog,
    autoDetectVoice,
    setAutoDetectVoice,
    toggleAutoDetectVoice,
    requestMicrophoneAccess
  };
};
