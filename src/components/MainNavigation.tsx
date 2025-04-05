
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Home, Bus, Map, Phone, Lock, Menu, Globe, ArrowLeft } from 'lucide-react'; // Imported Lock properly
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const MainNavigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const NavItems = () => (
    <>
      <NavigationMenuItem>
        <Link to="/">
          <Button variant={isActive('/') ? "default" : "ghost"} className="w-full flex items-center justify-start gap-2">
            <Home className="h-4 w-4" />
            <span>Forsíða</span>
          </Button>
        </Link>
      </NavigationMenuItem>
      
      <NavigationMenuItem>
        <Link to="/bus-tracking">
          <Button variant={isActive('/bus-tracking') ? "default" : "ghost"} className="w-full flex items-center justify-start gap-2">
            <Bus className="h-4 w-4" />
            <span>Strætó</span>
          </Button>
        </Link>
      </NavigationMenuItem>
      
      <NavigationMenuItem>
        <Link to="/ai-phone-landing">
          <Button variant={isActive('/ai-phone-landing') ? "default" : "ghost"} className="w-full flex items-center justify-start gap-2">
            <Phone className="h-4 w-4" />
            <span>AI sími</span>
            {!isActive('/ai-phone-landing') && <Lock className="h-3 w-3 ml-1 text-gray-400" />}
          </Button>
        </Link>
      </NavigationMenuItem>
      
      <NavigationMenuItem>
        <Link to="/ai-phone-agent">
          <Button variant={isActive('/ai-phone-agent') ? "default" : "ghost"} className="w-full flex items-center justify-start gap-2">
            <Globe className="h-4 w-4" />
            <span>AI aðstoðarmaður</span>
            {!isActive('/ai-phone-agent') && <Lock className="h-3 w-3 ml-1 text-gray-400" />}
          </Button>
        </Link>
      </NavigationMenuItem>

      <NavigationMenuItem>
        <NavigationMenuTrigger className="px-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" /> 
            <span>HTML skrár</span>
          </div>
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <div className="w-[200px] p-2 space-y-2">
            <a href="/ai-phone-agent/cloudflare/agents-starter/index.html" target="_blank" rel="noopener noreferrer" className="block p-2 hover:bg-gray-100 rounded-md">
              Cloudflare Agent
            </a>
            <a href="/ai-phone-agent/logs.nd" target="_blank" rel="noopener noreferrer" className="block p-2 hover:bg-gray-100 rounded-md">
              Logs skrá
            </a>
            <a href="/ai-phone-agent/status.nd" target="_blank" rel="noopener noreferrer" className="block p-2 hover:bg-gray-100 rounded-md">
              Status skrá
            </a>
            <a href="/ai-phone-agent/callflow.nd" target="_blank" rel="noopener noreferrer" className="block p-2 hover:bg-gray-100 rounded-md">
              Callflow skrá
            </a>
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </>
  );
  
  // Mobile navigation uses Sheet component for a side drawer
  if (isMobile) {
    return (
      <div className="flex items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Opna valmynd</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <div className="py-4">
              <h2 className="text-lg font-semibold mb-4 px-4">Reykjavíkurborg</h2>
              <nav className="flex flex-col gap-1 px-2">
                <NavItems />
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }
  
  // Desktop navigation
  return (
    <NavigationMenu>
      <NavigationMenuList className="space-x-2">
        <NavItems />
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default MainNavigation;
