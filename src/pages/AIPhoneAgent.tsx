
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone, Mic, Settings, ArrowLeft } from 'lucide-react';
import VoiceAssistant from '@/components/VoiceAssistant';

const AIPhoneAgent = () => {
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [settings, setSettings] = useState({
    voiceDetection: true,
    subtitles: true,
    language: 'is', // 'is' for Icelandic
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-iceland-blue/20 to-iceland-lightBlue/30">
      <header className="py-4 px-6 border-b border-iceland-blue/10 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span>Til baka</span>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-medium text-iceland-darkBlue">AI Raddaðstoðarmaður</h1>
          </div>
          <div className="w-24">
            {/* Placeholder for symmetry */}
          </div>
        </div>
      </header>

      <main className="py-8 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white/90 shadow-lg rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Raddaðstoðarmaður Reykjavíkurborgar</h2>
              <p className="text-iceland-darkBlue mb-4">
                Prófaðu nýjan raddaðstoðarmann Reykjavíkurborgar. Hann getur aðstoðað þig við ýmis málefni tengd borginni, 
                veitt upplýsingar um þjónustu, opnunartíma, viðburði og fleira.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-iceland-blue/5 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Phone className="h-5 w-5 text-iceland-blue mr-2" />
                    <h3 className="font-medium">Símaþjónusta</h3>
                  </div>
                  <p className="text-sm">Aðstoðarmaðurinn getur svarað í síma og aðstoðað með fyrirspurnir í gegnum símtal.</p>
                </div>
                <div className="bg-iceland-blue/5 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Mic className="h-5 w-5 text-iceland-blue mr-2" />
                    <h3 className="font-medium">Raddstýring</h3>
                  </div>
                  <p className="text-sm">Talaðu beint við aðstoðarmanninn og fáðu svör við spurningum þínum.</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-4 mb-6">
                <Button
                  variant={gender === 'female' ? 'default' : 'outline'}
                  onClick={() => setGender('female')}
                  className={gender === 'female' ? 'bg-iceland-blue' : ''}
                >
                  Rósa
                </Button>
                <Button
                  variant={gender === 'male' ? 'default' : 'outline'}
                  onClick={() => setGender('male')}
                  className={gender === 'male' ? 'bg-iceland-blue' : ''}
                >
                  Birkir
                </Button>
              </div>
            </div>
          </div>
          
          <div className="md:row-span-2 bg-white/90 shadow-lg rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Stillingar</h2>
              <Settings className="h-5 w-5 text-iceland-darkGray" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="voice-detection" className="text-sm font-medium">
                  Sjálfvirk raddgreining
                </label>
                <input
                  id="voice-detection"
                  type="checkbox"
                  checked={settings.voiceDetection}
                  onChange={() => setSettings({...settings, voiceDetection: !settings.voiceDetection})}
                  className="toggle"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label htmlFor="subtitles" className="text-sm font-medium">
                  Skjátextar
                </label>
                <input
                  id="subtitles"
                  type="checkbox"
                  checked={settings.subtitles}
                  onChange={() => setSettings({...settings, subtitles: !settings.subtitles})}
                  className="toggle"
                />
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium mb-3">Tungumál</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={settings.language === 'is' ? 'default' : 'outline'}
                    onClick={() => setSettings({...settings, language: 'is'})}
                    size="sm"
                    className={settings.language === 'is' ? 'bg-iceland-blue' : ''}
                  >
                    Íslenska
                  </Button>
                  <Button
                    variant={settings.language === 'en' ? 'default' : 'outline'}
                    onClick={() => setSettings({...settings, language: 'en'})}
                    size="sm"
                    className={settings.language === 'en' ? 'bg-iceland-blue' : ''}
                    disabled
                  >
                    English
                  </Button>
                </div>
                <p className="text-xs text-iceland-darkGray mt-2">
                  Fleiri tungumál verða í boði fljótlega.
                </p>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className="bg-white/90 shadow-lg rounded-xl">
              <VoiceAssistant
                assistantName={gender === 'female' ? 'Rósa' : 'Birkir'}
                gender={gender}
              />
            </div>
          </div>
        </div>
      </main>
      
      <footer className="py-6 px-4 border-t border-iceland-blue/10 bg-white/60 backdrop-blur-sm mt-8">
        <div className="max-w-7xl mx-auto text-center text-sm text-iceland-darkGray">
          <p>© {new Date().getFullYear()} Reykjavíkurborg - Þetta er sýnishorn af gervigreind aðstoðarmanni fyrir borgina</p>
        </div>
      </footer>
    </div>
  );
};

export default AIPhoneAgent;
