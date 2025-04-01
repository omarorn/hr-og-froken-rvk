
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Video, VideoOff, Camera, CameraOff } from 'lucide-react';

interface VideoChatProps {
  gender: 'female' | 'male';
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const VideoChat: React.FC<VideoChatProps> = ({ gender, isExpanded, onToggleExpand }) => {
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const avatarVideoRef = useRef<HTMLVideoElement>(null);
  
  // Initialize user video when enabled
  useEffect(() => {
    if (videoEnabled && userVideoRef.current) {
      initializeUserVideo();
    } else if (!videoEnabled && userVideoRef.current) {
      // Stop video tracks when disabled
      const videoElement = userVideoRef.current;
      if (videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
      }
    }
  }, [videoEnabled]);

  const initializeUserVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }
      setCameraPermission(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Ekki tókst að fá aðgang að myndavél.');
      setCameraPermission(false);
      setVideoEnabled(false);
    }
  };

  const toggleVideo = () => {
    setVideoEnabled(prev => !prev);
  };

  return (
    <div className={`video-chat transition-all duration-300 bg-white/90 rounded-xl shadow-md ${isExpanded ? 'p-4' : 'p-2'}`}>
      {isExpanded && (
        <div className="grid grid-cols-2 gap-4 mb-4 h-64">
          <div className="bg-iceland-gray/30 rounded-lg overflow-hidden relative flex items-center justify-center">
            {videoEnabled ? (
              <video 
                ref={userVideoRef} 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-iceland-darkGray text-center p-4">
                <CameraOff className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Myndavél af</p>
              </div>
            )}
          </div>
          
          <div className="bg-iceland-gray/30 rounded-lg overflow-hidden relative flex items-center justify-center">
            {gender === 'female' ? (
              <img 
                src="/rosa-avatar.png" 
                alt="Rósa" 
                className="h-32 w-32 object-contain"
              />
            ) : (
              <img 
                src="/birkir-avatar.png" 
                alt="Birkir" 
                className="h-32 w-32 object-contain"
              />
            )}
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-full aspect-square p-2"
          onClick={toggleVideo}
        >
          {videoEnabled ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-full"
          onClick={onToggleExpand}
        >
          {isExpanded ? 'Fela myndavél' : 'Sýna myndavél'}
        </Button>
      </div>
    </div>
  );
};

export default VideoChat;
