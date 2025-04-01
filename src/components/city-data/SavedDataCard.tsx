
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrapedDataRecord } from "@/integrations/supabase/client";
import { formatDate } from './utils';

interface SavedDataCardProps {
  record: ScrapedDataRecord;
  onCopyData: () => void;
  onDownloadData: () => void;
  onDeleteRecord: () => void;
}

export const SavedDataCard: React.FC<SavedDataCardProps> = ({ 
  record, 
  onCopyData, 
  onDownloadData, 
  onDeleteRecord 
}) => {
  return (
    <Card className="overflow-hidden">
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
          onClick={onCopyData}
        >
          Copy Text
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-8"
            onClick={onDownloadData}
          >
            Download
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-8 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
            onClick={onDeleteRecord}
          >
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
