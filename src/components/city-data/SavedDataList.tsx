
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Database, Loader2 } from 'lucide-react';
import { ScrapedDataRecord } from "@/integrations/supabase/client";
import { SavedDataCard } from './SavedDataCard';

interface SavedDataListProps {
  savedRecords: ScrapedDataRecord[];
  isLoading: boolean;
  onDeleteRecord: (id: string) => Promise<void>;
}

export const SavedDataList: React.FC<SavedDataListProps> = ({ 
  savedRecords, 
  isLoading, 
  onDeleteRecord 
}) => {
  // Helper function to handle data copying
  const handleCopyData = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success('Data copied to clipboard');
  };
  
  // Helper function to handle data downloading
  const handleDownloadData = (record: ScrapedDataRecord) => {
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
  };
  
  return (
    <CardContent>
      {isLoading ? (
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
            <SavedDataCard
              key={record.id}
              record={record}
              onCopyData={() => handleCopyData(record.data)}
              onDownloadData={() => handleDownloadData(record)}
              onDeleteRecord={() => onDeleteRecord(record.id)}
            />
          ))}
        </div>
      )}
    </CardContent>
  );
};
