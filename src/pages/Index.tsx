
import { useState, useEffect } from 'react';
import VoiceAssistant from '@/components/VoiceAssistant';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { getCurrentTime, formatIcelandicDate } from '@/services/timeService';
import MapView from '@/components/MapView';
import BusRouteInfo from '@/components/BusRouteInfo';
import WasteCollectionInfo from '@/components/WasteCollectionInfo';
import CityDataCrawler from '@/components/CityDataCrawler';
import { Link } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [activeTab, setActiveTab] = useState<string>('assistant');
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const isMobile = useIsMobile();
  
  // Update time periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(timer);
  }, []);
  
  // Format current date
  const formattedDate = formatIcelandicDate(new Date(), 'medium');
  
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
          
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 mt-4 sm:mt-0">
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
            
            <div className="text-sm text-iceland-darkBlue font-medium">
              {formattedDate} | {currentTime.hour.toString().padStart(2, '0')}:{currentTime.minute.toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      </header>
      
      <main className="py-8 px-4 max-w-7xl mx-auto">
        <div className="mb-6">
          <MainNavigation />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2 h-16">
              <div className="text-left">
                <div className="font-medium">Aðstoðarmaður</div>
                <div className="text-xs text-muted-foreground">Upplýsingar og hjálp</div>
              </div>
            </Button>
          </Link>
          
          <Link to="/bus-tracking">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2 h-16">
              <div className="text-left">
                <div className="font-medium">Strætó</div>
                <div className="text-xs text-muted-foreground">Rauntímastaðsetning strætó</div>
              </div>
            </Button>
          </Link>
          
          <Link to="/">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2 h-16">
              <div className="text-left">
                <div className="font-medium">Kort</div>
                <div className="text-xs text-muted-foreground">Staðsetningar og leiðir</div>
              </div>
            </Button>
          </Link>
          
          <Link to="/">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2 h-16">
              <div className="text-left">
                <div className="font-medium">Gögn</div>
                <div className="text-xs text-muted-foreground">Opið gagnasafn</div>
              </div>
            </Button>
          </Link>
          
          <Link to="/ai-phone-landing">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2 h-16 bg-iceland-blue/10 border-iceland-blue">
              <div className="text-left">
                <div className="font-medium">AI sími <Lock className="h-3 w-3 inline-block" /></div>
                <div className="text-xs text-muted-foreground">Raddaðstoðarmaður</div>
              </div>
            </Button>
          </Link>
        </div>
        
        <Tabs defaultValue="assistant" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} w-full mx-auto`}>
            <TabsTrigger value="assistant">Aðstoðarmaður</TabsTrigger>
            <TabsTrigger value="map">Kort</TabsTrigger>
            {!isMobile && (
              <>
                <TabsTrigger value="services">Þjónustur</TabsTrigger>
                <TabsTrigger value="data">Gögn</TabsTrigger>
              </>
            )}
          </TabsList>
          
          <TabsContent value="assistant" className="space-y-4">
            <VoiceAssistant 
              assistantName={gender === 'female' ? 'Rósa' : 'Birkir'}
              gender={gender}
            />
          </TabsContent>
          
          <TabsContent value="map" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <MapView 
                  showSearchBar={true} 
                  showDirections={true}
                />
              </div>
              <div>
                <BusRouteInfo 
                  destinationName="Kringlan"
                  onViewOnMap={(originLat, originLng, destLat, destLng) => {
                    toast.info('Skoða leiðir á korti');
                  }}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="services" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WasteCollectionInfo postalCode="101" />
              <BusRouteInfo showMap={false} />
            </div>
          </TabsContent>
          
          <TabsContent value="data" className="space-y-4">
            <CityDataCrawler />
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="py-6 px-4 border-t border-iceland-blue/10 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center text-sm text-iceland-darkGray">
          <p>© {new Date().getFullYear()} Reykjavíkurborg - Þetta er sýnishorn af gervigreind aðstoðarmanni fyrir borgina</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
