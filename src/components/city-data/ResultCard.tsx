
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Database } from 'lucide-react';
import { formatDate } from './utils';
import { CrawlResult } from './CityDataCrawler';

interface ResultCardProps {
  result: CrawlResult;
  onCopyData: () => void;
  onDownloadData: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ 
  result, 
  onCopyData, 
  onDownloadData 
}) => {
  return (
    <Card className="overflow-hidden">
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
          onClick={onCopyData}
        >
          Copy Text
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs h-8"
          onClick={onDownloadData}
        >
          Download
        </Button>
      </CardFooter>
    </Card>
  );
};
