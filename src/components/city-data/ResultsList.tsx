
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';
import { CrawlResult } from './CityDataCrawler';
import { ResultCard } from './ResultCard';

interface ResultsListProps {
  results: CrawlResult[];
}

export const ResultsList: React.FC<ResultsListProps> = ({ results }) => {
  // Helper function to handle data copying
  const handleCopyData = (data: any) => {
    const textToCopy = typeof data === 'string' 
      ? data 
      : JSON.stringify(data, null, 2);
    
    navigator.clipboard.writeText(textToCopy);
    toast.success('Data copied to clipboard');
  };
  
  // Helper function to handle data downloading
  const handleDownloadData = (data: any, filename: string) => {
    const textToDownload = typeof data === 'string' 
      ? data 
      : JSON.stringify(data, null, 2);
    
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('File downloaded');
  };
  
  return (
    <CardContent>
      {results.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
          <p>No scrape results yet. Start a scrape to see data here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result, index) => (
            <ResultCard
              key={index}
              result={result}
              onCopyData={() => handleCopyData(result.data)}
              onDownloadData={() => handleDownloadData(
                result.data, 
                `${result.domain.replace(/\./g, '-')}-${new Date(result.timestamp).toISOString().split('T')[0]}.txt`
              )}
            />
          ))}
        </div>
      )}
    </CardContent>
  );
};
