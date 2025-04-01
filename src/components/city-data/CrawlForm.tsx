
import React, { useState } from 'react';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, DownloadCloud, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { scrapingService } from '@/services/scrapingService';
import { CrawlResult } from './CityDataCrawler';

interface CrawlFormProps {
  onCrawlSuccess: (result: CrawlResult) => void;
}

export const CrawlForm: React.FC<CrawlFormProps> = ({ onCrawlSuccess }) => {
  const [url, setUrl] = useState<string>('https://reykjavik.is');
  const [maxPages, setMaxPages] = useState<number>(20);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

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
      
      toast.success(`Successfully scraped ${result.domain}`);
      onCrawlSuccess(result);
      
    } catch (error) {
      console.error('Error during scrape:', error);
      toast.error('Failed to scrape the website. Please try again.');
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  return (
    <>
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
    </>
  );
};
