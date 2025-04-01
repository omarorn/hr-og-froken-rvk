import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Recycle, Trash2, Calendar, AlertCircle, RefreshCcw, Leaf } from 'lucide-react';
import { getWasteCollectionSchedule, WasteCollectionSchedule } from '@/services/reykjavikDataService';
import { formatIcelandicDate, getIcelandicDayName } from '@/services/timeService';

interface WasteCollectionInfoProps {
  postalCode?: string;
  showAllDetails?: boolean;
}

const WasteCollectionInfo: React.FC<WasteCollectionInfoProps> = ({
  postalCode = "101",
  showAllDetails = true
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [schedule, setSchedule] = useState<WasteCollectionSchedule | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("next");

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const scheduleData = await getWasteCollectionSchedule(postalCode);
        setSchedule(scheduleData);
      } catch (error) {
        console.error("Error fetching waste collection schedule:", error);
        setError("Could not load waste collection schedule");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchedule();
  }, [postalCode]);

  const handleRefresh = () => {
    setLoading(true);
    
    getWasteCollectionSchedule(postalCode)
      .then(scheduleData => {
        setSchedule(scheduleData);
        setError(null);
      })
      .catch(err => {
        console.error("Error refreshing waste collection schedule:", err);
        setError("Could not refresh waste collection schedule");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getNextCollectionDayInfo = () => {
    if (!schedule || !schedule.nextCollection.date) return null;
    
    const collectionDate = new Date(schedule.nextCollection.date);
    const dayName = getIcelandicDayName(collectionDate.getDay());
    const formattedDate = formatIcelandicDate(collectionDate, "medium");
    
    return { dayName, formattedDate };
  };

  const nextCollectionInfo = getNextCollectionDayInfo();

  const getWasteTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "general waste": return "destructive";
      case "recycling": return "default";
      case "organic waste": return "secondary";
      case "paper waste": return "default";
      default: return "secondary";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <Recycle className="h-5 w-5" />
            <span>Waste Collection</span>
          </CardTitle>
          <Badge variant="outline">{postalCode}</Badge>
        </div>
        <CardDescription>
          {schedule ? `Area: ${schedule.area}` : "Loading area information..."}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-destructive">{error}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm" className="mt-2">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : schedule ? (
          <Tabs 
            defaultValue="next" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="next">Next Collection</TabsTrigger>
              <TabsTrigger value="schedule">Full Schedule</TabsTrigger>
            </TabsList>
            
            <TabsContent value="next" className="pt-4">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 border rounded-lg bg-muted/50">
                  <div className="mt-1">
                    {schedule.nextCollection.type.toLowerCase().includes("organic") ? (
                      <Leaf className="h-8 w-8 text-green-500" />
                    ) : schedule.nextCollection.type.toLowerCase().includes("recycling") ? (
                      <Recycle className="h-8 w-8 text-blue-500" />
                    ) : (
                      <Trash2 className="h-8 w-8 text-gray-500" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">
                      {schedule.nextCollection.type}
                    </h3>
                    
                    {nextCollectionInfo && (
                      <div className="space-y-1 mt-1">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{nextCollectionInfo.dayName}, {nextCollectionInfo.formattedDate}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Badge variant={getWasteTypeColor(schedule.nextCollection.type) as any}>
                    Next
                  </Badge>
                </div>
                
                <Button 
                  onClick={handleRefresh} 
                  variant="outline" 
                  className="w-full"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="schedule" className="pt-4">
              <div className="space-y-4">
                {Object.entries(schedule.schedule).map(([wasteType, days]) => {
                  const formattedType = wasteType
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase());
                    
                  return (
                    <div key={wasteType} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {wasteType.includes("organic") ? (
                            <Leaf className="h-5 w-5 text-green-500" />
                          ) : wasteType.includes("recycling") ? (
                            <Recycle className="h-5 w-5 text-blue-500" />
                          ) : (
                            <Trash2 className="h-5 w-5 text-gray-500" />
                          )}
                          <span className="font-medium">{formattedType}</span>
                        </div>
                        <Badge variant={
                          wasteType.includes("organic") ? "secondary" : 
                          wasteType.includes("recycling") ? "default" :
                          wasteType.includes("paper") ? "default" : 
                          "secondary"
                        }>
                          {days.length} days
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-1">
                        {days.map((day, i) => (
                          <Badge key={i} variant="outline">
                            {day}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
                
                <Button 
                  onClick={handleRefresh} 
                  variant="outline" 
                  className="w-full"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No schedule information available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WasteCollectionInfo;
