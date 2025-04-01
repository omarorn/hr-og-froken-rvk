
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Globe, FileText, DownloadCloud, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CrawlResult {
  status: 'success' | 'error';
  domain: string;
  pages: number;
  data: string;
  timestamp: string;
}

const CityDataCrawler: React.FC = () => {
  const [url, setUrl] = useState<string>('https://reykjavik.is');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [crawlResults, setCrawlResults] = useState<CrawlResult[]>([]);
  const [activeTab, setActiveTab] = useState<string>('crawl');

  // Simulated crawler function
  const simulateCrawl = async (targetUrl: string): Promise<CrawlResult> => {
    // Validate URL
    if (!targetUrl.startsWith('http')) {
      targetUrl = 'https://' + targetUrl;
    }
    
    const domain = new URL(targetUrl).hostname;
    
    // Simulate progress updates
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Generate mock result
    return {
      status: 'success',
      domain,
      pages: Math.floor(Math.random() * 50) + 10,
      data: `Mock crawl data from ${domain}. This would contain the extracted content from ${Math.floor(Math.random() * 50) + 10} pages on the Reykjavik website, including information about city services, events, and resources.`,
      timestamp: new Date().toISOString()
    };
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast.error('Please enter a URL to crawl');
      return;
    }
    
    try {
      setIsLoading(true);
      setProgress(0);
      
      const result = await simulateCrawl(url);
      
      setCrawlResults(prev => [result, ...prev]);
      setActiveTab('results');
      
      toast.success(`Successfully crawled ${result.domain}`);
    } catch (error) {
      console.error('Error during crawl:', error);
      toast.error('Failed to crawl the website. Please try again.');
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          <span>Reykjavik Data Crawler</span>
        </CardTitle>
        <CardDescription>
          Extract and analyze information from the Reykjavik city website
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mx-6">
          <TabsTrigger value="crawl">Crawl Website</TabsTrigger>
          <TabsTrigger value="results">
            Results {crawlResults.length > 0 && `(${crawlResults.length})`}
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
              
              {isLoading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Crawling in progress...</span>
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
                    Crawling...
                  </>
                ) : (
                  <>
                    <DownloadCloud className="h-4 w-4 mr-2" />
                    Start Crawl
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="text-xs text-muted-foreground border-t px-6 py-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                This tool extracts information from Reykjavik's website.
                Please use responsibly and respect the website's terms of service.
              </p>
            </div>
          </CardFooter>
        </TabsContent>
        
        <TabsContent value="results">
          <CardContent>
            {crawlResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No crawl results yet. Start a crawl to see data here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {crawlResults.map((result, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">{result.domain}</CardTitle>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(result.timestamp)}
                        </span>
                      </div>
                      <CardDescription className="text-xs">
                        Crawled {result.pages} pages
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <Textarea 
                        value={result.data} 
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
                          navigator.clipboard.writeText(result.data);
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
                          const blob = new Blob([result.data], { type: 'text/plain' });
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
      </Tabs>
    </Card>
  );
};

export default CityDataCrawler;
