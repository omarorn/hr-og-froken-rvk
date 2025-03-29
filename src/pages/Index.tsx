
import { useState } from 'react';
import VoiceAssistant from '@/components/VoiceAssistant';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Index = () => {
  const [gender, setGender] = useState<'female' | 'male'>('female');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-iceland-blue/10 to-iceland-lightBlue/20">
      <header className="py-6 px-4 md:px-8 border-b border-iceland-blue/10 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center">
          <div className="flex items-center space-x-2">
            <img 
              src="https://reykjavik.is/sites/default/files/favicons/favicon-96x96.png" 
              alt="Reykjavíkurborg logo" 
              className="h-10 w-10"
            />
            <h1 className="text-2xl font-medium text-iceland-darkBlue">Reykjavíkurborg</h1>
          </div>
          
          <div className="flex items-center space-x-6 mt-4 sm:mt-0">
            <div className="flex items-center space-x-2">
              <Label htmlFor="assistant-toggle" className="text-sm">
                {gender === 'female' ? 'Rósa' : 'Birkir'}
              </Label>
              <Switch 
                id="assistant-toggle" 
                checked={gender === 'male'}
                onCheckedChange={(checked) => setGender(checked ? 'male' : 'female')}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="text-iceland-blue border-iceland-blue hover:bg-iceland-blue/10">
                Íslenska
              </Button>
              <Button variant="ghost" size="sm" className="text-iceland-darkGray hover:bg-iceland-gray">
                English
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="py-8 px-4">
        <VoiceAssistant 
          assistantName={gender === 'female' ? 'Rósa' : 'Birkir'}
          gender={gender}
        />
      </main>
    </div>
  );
};

export default Index;
