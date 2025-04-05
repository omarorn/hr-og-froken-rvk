
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone, Mic, Settings, ArrowLeft, MessageSquare, Globe, AlertCircle, FileBadge } from 'lucide-react';
import VoiceAssistant from '@/components/VoiceAssistant';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LogsViewer from '@/components/LogsViewer';
import MainNavigation from '@/components/MainNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

const AIPhoneLanding = () => {
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [settings, setSettings] = useState({
    voiceDetection: true,
    subtitles: true,
    language: 'is', // 'is' for Icelandic
    darkMode: false,
    videoChat: false
  });
  const [showLogs, setShowLogs] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    supabase: boolean;
    assistant: boolean;
    speech: boolean;
  }>({
    supabase: false,
    assistant: false,
    speech: false
  });
  const isMobile = useIsMobile();

  // Check connection to Supabase functions
  useEffect(() => {
    const checkConnections = async () => {
      try {
        // Check Supabase connection
        const { data: pingData, error: pingError } = await supabase.functions.invoke('time-mcp', {
          body: { action: 'ping' }
        });
        
        setConnectionStatus(prev => ({
          ...prev,
          supabase: !pingError && pingData?.status === 'ok'
        }));

        // We'll use the presence or absence of errors to determine status in the next checks
        
        // Check assistant API
        try {
          const { data: assistantData, error: assistantError } = await supabase.functions.invoke('assistants', {
            body: { action: 'status' }
          });
          
          setConnectionStatus(prev => ({
            ...prev,
            assistant: !assistantError && assistantData?.status === 'ok'
          }));
        } catch (e) {
          console.error('Assistant check error:', e);
          setConnectionStatus(prev => ({ ...prev, assistant: false }));
        }
        
        // Check speech API
        try {
          const { data: speechData, error: speechError } = await supabase.functions.invoke('speech', {
            body: { action: 'status' }
          });
          
          setConnectionStatus(prev => ({
            ...prev,
            speech: !speechError && speechData?.status === 'ok'
          }));
        } catch (e) {
          console.error('Speech check error:', e);
          setConnectionStatus(prev => ({ ...prev, speech: false }));
        }
      } catch (e) {
        console.error('Connection check error:', e);
        toast.error('Ekki tókst að tengjast bakenda. Sumar aðgerðir virka ekki.');
        setConnectionStatus({
          supabase: false,
          assistant: false,
          speech: false
        });
      }
    };
    
    checkConnections();
  }, []);

  // Helper function to render connection alert if needed
  const renderConnectionAlert = () => {
    const allConnected = connectionStatus.supabase && connectionStatus.assistant && connectionStatus.speech;
    
    if (allConnected) return null;
    
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Tengivandamál</AlertTitle>
        <AlertDescription>
          <p>Sumar aðgerðir virka ekki eins og til er ætlast vegna tengingarvandamála:</p>
          <ul className="list-disc ml-6 mt-2">
            {!connectionStatus.supabase && <li>Tengingu við Supabase bakenda vantar</li>}
            {!connectionStatus.assistant && <li>Tengingu við aðstoðarmann vantar</li>}
            {!connectionStatus.speech && <li>Tengingu við raddþjónustu vantar</li>}
          </ul>
          <p className="mt-2">Prófaðu grunnviðmótið eða komdu aftur síðar.</p>
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-iceland-blue/20 to-iceland-lightBlue/30'}`}>
      <header className={`py-4 px-6 border-b ${settings.darkMode ? 'border-gray-700 bg-gray-800' : 'border-iceland-blue/10 bg-white/80 backdrop-blur-sm'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {isMobile ? (
              <MainNavigation />
            ) : (
              <Link to="/" className="flex items-center">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span>Til baka</span>
              </Link>
            )}
          </div>
          <div className="text-center">
            <h1 className={`text-xl font-medium ${settings.darkMode ? 'text-white' : 'text-iceland-darkBlue'}`}>
              AI Raddaðstoðarmaður
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              size="sm"
              variant="outline"
              onClick={() => setShowLogs(!showLogs)}
              className="flex items-center"
            >
              <FileBadge className="h-4 w-4 mr-1" />
              {showLogs ? 'Fela skrár' : 'Sýna skrár'}
            </Button>
            <Switch 
              id="dark-mode" 
              checked={settings.darkMode}
              onCheckedChange={() => setSettings({...settings, darkMode: !settings.darkMode})}
            />
            <Label htmlFor="dark-mode" className="ml-2 hidden md:inline">
              {settings.darkMode ? 'Ljóst' : 'Dökkt'}
            </Label>
          </div>
        </div>
      </header>

      <main className="py-8 px-4 max-w-7xl mx-auto">
        {!isMobile && (
          <div className="mb-6">
            <MainNavigation />
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white/90'} shadow-lg rounded-xl p-6 mb-6`}>
              {renderConnectionAlert()}
              
              <h2 className="text-xl font-semibold mb-4">Velkomin á prufu-síðu raddaðstoðarmanns</h2>
              <p className={`${settings.darkMode ? 'text-gray-300' : 'text-iceland-darkBlue'} mb-6`}>
                Prófaðu nýjan raddaðstoðarmann Reykjavíkurborgar með sérstillingum. Þessi síða leyfir þér að 
                prófa aðstoðarmanninn með mismunandi stillingum og viðmóti.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className={`${settings.darkMode ? 'bg-gray-700' : 'bg-iceland-blue/5'} p-4 rounded-lg`}>
                  <div className="flex items-center mb-2">
                    <Phone className={`h-5 w-5 ${settings.darkMode ? 'text-blue-400' : 'text-iceland-blue'} mr-2`} />
                    <h3 className="font-medium">Símaþjónusta</h3>
                  </div>
                  <p className="text-sm">Aðstoðarmaðurinn svarar fyrirspurnum í gegnum símtal eða texta.</p>
                </div>
                <div className={`${settings.darkMode ? 'bg-gray-700' : 'bg-iceland-blue/5'} p-4 rounded-lg`}>
                  <div className="flex items-center mb-2">
                    <Mic className={`h-5 w-5 ${settings.darkMode ? 'text-blue-400' : 'text-iceland-blue'} mr-2`} />
                    <h3 className="font-medium">Raddstýring</h3>
                  </div>
                  <p className="text-sm">Talaðu beint við aðstoðarmanninn og fáðu svör við spurningum þínum.</p>
                </div>
                <div className={`${settings.darkMode ? 'bg-gray-700' : 'bg-iceland-blue/5'} p-4 rounded-lg`}>
                  <div className="flex items-center mb-2">
                    <MessageSquare className={`h-5 w-5 ${settings.darkMode ? 'text-blue-400' : 'text-iceland-blue'} mr-2`} />
                    <h3 className="font-medium">Spjall</h3>
                  </div>
                  <p className="text-sm">Spjallaðu við aðstoðarmanninn með texta ef þú kýst það frekar.</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-4 mb-6">
                <Button
                  variant={gender === 'female' ? 'default' : 'outline'}
                  onClick={() => setGender('female')}
                  className={gender === 'female' ? `${settings.darkMode ? 'bg-blue-600' : 'bg-iceland-blue'}` : ''}
                >
                  Rósa
                </Button>
                <Button
                  variant={gender === 'male' ? 'default' : 'outline'}
                  onClick={() => setGender('male')}
                  className={gender === 'male' ? `${settings.darkMode ? 'bg-blue-600' : 'bg-iceland-blue'}` : ''}
                >
                  Birkir
                </Button>
              </div>
              
              {showLogs && (
                <div className="mt-6 mb-4">
                  <LogsViewer />
                </div>
              )}
              
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium">Samþættingar og API</h3>
                <div className="flex space-x-2">
                  <Link to="/ai-phone-agent">
                    <Button size="sm" variant="outline">
                      Skoða hefðbundið viðmót
                    </Button>
                  </Link>
                  
                  <a href="/ai-phone-agent/cloudflare/agents-starter/index.html" target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline">
                      Cloudflare Agent
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:row-span-2 lg:col-span-1">
            <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white/90'} shadow-lg rounded-xl p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Stillingar prufusíðu</h2>
                <Settings className={`h-5 w-5 ${settings.darkMode ? 'text-gray-400' : 'text-iceland-darkGray'}`} />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="voice-detection" className="text-sm font-medium">
                    Sjálfvirk raddgreining
                  </label>
                  <Switch
                    id="voice-detection"
                    checked={settings.voiceDetection}
                    onCheckedChange={() => setSettings({...settings, voiceDetection: !settings.voiceDetection})}
                    disabled={!connectionStatus.supabase || !connectionStatus.speech}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label htmlFor="subtitles" className="text-sm font-medium">
                    Skjátextar
                  </label>
                  <Switch
                    id="subtitles"
                    checked={settings.subtitles}
                    onCheckedChange={() => setSettings({...settings, subtitles: !settings.subtitles})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label htmlFor="video-chat" className="text-sm font-medium">
                    Myndbandssamtal
                  </label>
                  <Switch
                    id="video-chat"
                    checked={settings.videoChat}
                    onCheckedChange={() => setSettings({...settings, videoChat: !settings.videoChat})}
                  />
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium mb-3">Tungumál</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={settings.language === 'is' ? 'default' : 'outline'}
                      onClick={() => setSettings({...settings, language: 'is'})}
                      size="sm"
                      className={settings.language === 'is' ? `${settings.darkMode ? 'bg-blue-600' : 'bg-iceland-blue'}` : ''}
                    >
                      <Globe className="h-4 w-4 mr-1" />
                      Íslenska
                    </Button>
                    <Button
                      variant={settings.language === 'en' ? 'default' : 'outline'}
                      onClick={() => setSettings({...settings, language: 'en'})}
                      size="sm"
                      className={settings.language === 'en' ? `${settings.darkMode ? 'bg-blue-600' : 'bg-iceland-blue'}` : ''}
                      disabled
                    >
                      <Globe className="h-4 w-4 mr-1" />
                      English
                    </Button>
                  </div>
                  <p className={`text-xs ${settings.darkMode ? 'text-gray-400' : 'text-iceland-darkGray'} mt-2`}>
                    Fleiri tungumál verða í boði fljótlega.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium mb-3">Aðgangur að skrám</h3>
                  <div className="space-y-2">
                    <a href="/ai-phone-agent/logs.nd" target="_blank" rel="noopener noreferrer" className="block">
                      <Button variant="outline" size="sm" className="w-full flex items-center justify-start">
                        <FileBadge className="h-4 w-4 mr-2" />
                        Logs
                      </Button>
                    </a>
                    <a href="/ai-phone-agent/status.nd" target="_blank" rel="noopener noreferrer" className="block">
                      <Button variant="outline" size="sm" className="w-full flex items-center justify-start">
                        <FileBadge className="h-4 w-4 mr-2" />
                        Status
                      </Button>
                    </a>
                    <a href="/ai-phone-agent/callflow.nd" target="_blank" rel="noopener noreferrer" className="block">
                      <Button variant="outline" size="sm" className="w-full flex items-center justify-start">
                        <FileBadge className="h-4 w-4 mr-2" />
                        Callflow
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white/90'} shadow-lg rounded-xl`}>
              <VoiceAssistant
                assistantName={gender === 'female' ? 'Rósa' : 'Birkir'}
                gender={gender}
                key={gender} // Add key to force re-mounting when gender changes
              />
            </div>
          </div>
        </div>
      </main>
      
      <footer className={`py-6 px-4 border-t ${settings.darkMode ? 'border-gray-700 bg-gray-800' : 'border-iceland-blue/10 bg-white/60 backdrop-blur-sm'} mt-8`}>
        <div className="max-w-7xl mx-auto text-center text-sm text-iceland-darkGray">
          <p>© {new Date().getFullYear()} Reykjavíkurborg - Þetta er prufusíða af gervigreind aðstoðarmanni fyrir borgina</p>
        </div>
      </footer>
    </div>
  );
};

export default AIPhoneLanding;
