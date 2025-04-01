
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, AlertCircle } from 'lucide-react';
import { ScrapedDataRecord } from "@/integrations/supabase/client";
import { scrapingService } from '@/services/scrapingService';
import { CrawlForm } from './CrawlForm';
import { ResultsList } from './ResultsList';
import { SavedDataList } from './SavedDataList';

// Shared type used across components
export interface CrawlResult {
  id?: string;
  status: 'success' | 'error';
  domain: string;
  pages: number;
  data: string | any[];
  timestamp: string;
  savedToDb?: boolean;
}

const CityDataCrawler: React.FC = () => {
  const [crawlResults, setCrawlResults] = useState<CrawlResult[]>([]);
  const [activeTab, setActiveTab] = useState<string>('crawl');
  const [savedRecords, setSavedRecords] = useState<ScrapedDataRecord[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState<boolean>(false);

  // Load previously saved records from Supabase
  useEffect(() => {
    const fetchSavedRecords = async () => {
      setIsLoadingSaved(true);
      try {
        const records = await scrapingService.getAllScrapedData();
        setSavedRecords(records);
      } catch (error) {
        console.error('Exception fetching saved records:', error);
      } finally {
        setIsLoadingSaved(false);
      }
    };

    fetchSavedRecords();
  }, []);

  // Handle successful crawl
  const handleCrawlSuccess = (result: CrawlResult) => {
    setCrawlResults(prev => [result, ...prev]);
    setActiveTab('results');
    
    // Refresh saved records if the data was saved to the database
    if (result.savedToDb) {
      refreshSavedRecords();
    }
  };

  // Refresh saved records
  const refreshSavedRecords = async () => {
    const records = await scrapingService.getAllScrapedData();
    setSavedRecords(records);
  };

  // Handle deleting a saved record
  const handleDeleteRecord = async (id: string) => {
    try {
      const success = await scrapingService.deleteScrapedData(id);
      
      if (success) {
        setSavedRecords(prev => prev.filter(record => record.id !== id));
        setCrawlResults(prev => prev.filter(result => result.id !== id));
      }
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          <span>Reykjavik Data Scraper</span>
        </CardTitle>
        <CardDescription>
          Extract and analyze information from Reykjavik websites and store it in your database
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mx-6">
          <TabsTrigger value="crawl">Scrape Website</TabsTrigger>
          <TabsTrigger value="results">
            Results {crawlResults.length > 0 && `(${crawlResults.length})`}
          </TabsTrigger>
          <TabsTrigger value="saved">
            Saved Data {savedRecords.length > 0 && `(${savedRecords.length})`}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="crawl">
          <CrawlForm onCrawlSuccess={handleCrawlSuccess} />
        </TabsContent>
        
        <TabsContent value="results">
          <ResultsList results={crawlResults} />
        </TabsContent>
        
        <TabsContent value="saved">
          <SavedDataList 
            savedRecords={savedRecords} 
            isLoading={isLoadingSaved} 
            onDeleteRecord={handleDeleteRecord} 
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default CityDataCrawler;
