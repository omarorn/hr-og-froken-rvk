
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { StraetoRoute } from '@/services/straeto';

interface RouteSelectorProps {
  routes: StraetoRoute[];
  selectedRouteId: string | undefined;
  onRouteChange: (routeId: string) => void;
  onRefresh: () => void;
  loading: boolean;
  refreshing: boolean;
}

const RouteSelector: React.FC<RouteSelectorProps> = ({
  routes,
  selectedRouteId,
  onRouteChange,
  onRefresh,
  loading,
  refreshing
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div className="w-full sm:w-64">
        <Select 
          value={selectedRouteId} 
          onValueChange={onRouteChange}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a bus route" />
          </SelectTrigger>
          <SelectContent>
            {routes.map(route => (
              <SelectItem key={route.id} value={route.id}>
                <span className="flex items-center gap-2">
                  <Badge
                    style={{ 
                      backgroundColor: route.color || '#1d4ed8',
                      color: route.textColor || '#ffffff'
                    }}
                  >
                    {route.shortName}
                  </Badge>
                  {route.longName}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh} 
        disabled={refreshing}
        className="whitespace-nowrap"
      >
        <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </div>
  );
};

export default RouteSelector;
