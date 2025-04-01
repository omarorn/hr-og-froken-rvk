import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Globe, FileText, DownloadCloud, Database, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, ScrapedDataRecord } from "@/integrations/supabase/client";
import { scrapingService } from '@/services/scrapingService';

interface CrawlResult {
  id?: string;
  status: 'success' | 'error';
  domain: string;
  pages: number;
  data: string | any[];
  timestamp: string;
  savedToDb?: boolean;
}

const CityDataCrawler: React.FC = () => {
  const [url, setUrl] = useState<string>('https://reykjavik.is');
  const [maxPages, setMaxPages] = useState<number>(20);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
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
        toast.error('Failed to load saved data');
      } finally {
        setIsLoadingSaved(false);
      }
    };

    fetchSavedRecords();
  }, []);

  // Handle form submission to scrape a website
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast.error('Please enter a URL to scrape');
      return;
    }
    
    try {
      setIsLoading(true);
      setProgress(0);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 5;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);

      // Try to use the MCP server first, with fallback to edge function
      const scrapeResult = await scrapingService.scrapeWebsite(url, maxPages);

      clearInterval(progressInterval);
      setProgress(100);
      
      if (!scrapeResult.success) {
        toast.error(`Failed to scrape: ${scrapeResult.error}`);
        return;
      }

      const scrapedData = scrapeResult.data;
      
      // Format the result for display
      const result: CrawlResult = {
        id: scrapedData.recordId,
        status: 'success',
        domain: scrapedData.domain,
        pages: scrapedData.pagesScraped,
        data: scrapedData.data,
        timestamp: new Date().toISOString(),
        savedToDb: !!scrapedData.recordId
      };
      
      setCrawlResults(prev => [result, ...prev]);
      setActiveTab('results');
      
      toast.success(`Successfully scraped ${result.domain}`);
      
      // Refresh saved records if the data was saved to the database
      if (result.savedToDb) {
        const records = await scrapingService.getAllScrapedData();
        setSavedRecords(records);
      }
    } catch (error) {
      console.error('Error during scrape:', error);
      toast.error('Failed to scrape the website. Please try again.');
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  // Helper to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('is-IS', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle deleting a saved record
  const handleDeleteRecord = async (id: string) => {
    try {
      const success = await scrapingService.deleteScrapedData(id);
      
      if (!success) {
        toast.error('Failed to delete record');
      } else {
        toast.success('Record deleted successfully');
        setSavedRecords(prev => prev.filter(record => record.id !== id));
        setCrawlResults(prev => prev.filter(result => result.id !== id));
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Failed to delete record');
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
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium">Website URL</label>
                <Input
                  id="url"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://reykjavik.is"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="maxPages" className="text-sm font-medium">Maximum Pages</label>
                <Input
                  id="maxPages"
                  type="number"
                  value={maxPages}
                  onChange={(e) => setMaxPages(Number(e.target.value))}
                  min={1}
                  max={50}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">Limit: 50 pages per scrape</p>
              </div>
              
              {isLoading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Scraping in progress...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full h-2" />
                </div>
              )}
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <DownloadCloud className="h-4 w-4 mr-2" />
                    Start Scrape
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="text-xs text-muted-foreground border-t px-6 py-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                This tool extracts information from Reykjavik's websites.
                Please use responsibly and respect the website's terms of service.
                Data will be saved to the Supabase database.
              </p>
            </div>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="results">
          <CardContent>
            {crawlResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No scrape results yet. Start a scrape to see data here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {crawlResults.map((result, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{result.domain}</CardTitle>
                          {result.savedToDb && (
                            <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-0.5 rounded-full flex items-center">
                              <Database className="h-3 w-3 mr-1" />
                              Saved
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(result.timestamp)}
                        </span>
                      </div>
                      <CardDescription className="text-xs">
                        Scraped {result.pages} pages
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <Textarea 
                        value={typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2)} 
                        readOnly 
                        className="min-h-[100px] resize-none font-mono text-xs"
                      />
                    </CardContent>
                    <CardFooter className="flex justify-between py-2 px-6 bg-muted/30 border-t">
                      <Button
                        variant="ghost" 
                        size="sm" 
                        className="text-xs h-8"
                        onClick={() => {
                          const textToCopy = typeof result.data === 'string' 
                            ? result.data 
                            : JSON.stringify(result.data, null, 2);
                          navigator.clipboard.writeText(textToCopy);
                          toast.success('Data copied to clipboard');
                        }}
                      >
                        Copy Text
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs h-8"
                        onClick={() => {
                          const textToDownload = typeof result.data === 'string' 
                            ? result.data 
                            : JSON.stringify(result.data, null, 2);
                          const blob = new Blob([textToDownload], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${result.domain.replace(/\./g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                          toast.success('File downloaded');
                        }}
                      >
                        Download
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </TabsContent>
        
        <TabsContent value="saved">
          <CardContent>
            {isLoadingSaved ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : savedRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No saved data found in the database.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedRecords.map((record) => (
                  <Card key={record.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">{record.domain}</CardTitle>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(record.scraped_at)}
                        </span>
                      </div>
                      <CardDescription className="text-xs flex justify-between">
                        <span>Scraped {record.pages_scraped} pages</span>
                        <span className="text-xs">{record.url}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <Textarea 
                        value={JSON.stringify(record.data, null, 2)} 
                        readOnly 
                        className="min-h-[100px] resize-none font-mono text-xs"
                      />
                    </CardContent>
                    <CardFooter className="flex justify-between py-2 px-6 bg-muted/30 border-t">
                      <Button
                        variant="ghost" 
                        size="sm" 
                        className="text-xs h-8"
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(record.data, null, 2));
                          toast.success('Data copied to clipboard');
                        }}
                      >
                        Copy Text
                      </Button>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs h-8"
                          onClick={() => {
                            const blob = new Blob([JSON.stringify(record.data, null, 2)], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${record.domain.replace(/\./g, '-')}-${record.scraped_at.split('T')[0]}.txt`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            toast.success('File downloaded');
                          }}
                        >
                          Download
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs h-8 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                          onClick={() => handleDeleteRecord(record.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default CityDataCrawler;
