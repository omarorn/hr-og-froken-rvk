
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface LogFile {
  name: string;
  content: string;
}

const LogsViewer: React.FC = () => {
  const [logFiles, setLogFiles] = useState<LogFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        
        // Get the list of log files
        const logFileNames = [
          'logs.nd',
          'status.nd',
          'callflow.nd'
        ];
        
        const loadedLogs = await Promise.all(
          logFileNames.map(async (fileName) => {
            try {
              const response = await fetch(`/ai-phone-agent/${fileName}`);
              if (!response.ok) {
                console.warn(`Could not load ${fileName}`);
                return {
                  name: fileName,
                  content: `# File Not Found\n\nThe file ${fileName} could not be loaded or doesn't exist.`
                };
              }
              const content = await response.text();
              return { name: fileName, content };
            } catch (err) {
              console.error(`Error loading ${fileName}:`, err);
              return {
                name: fileName,
                content: `# Error Loading File\n\nFailed to load ${fileName}: ${err.message}`
              };
            }
          })
        );
        
        setLogFiles(loadedLogs);
      } catch (err) {
        console.error("Error fetching log files:", err);
        setError("Failed to load log files. Check the console for details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Simple markdown parser for basic elements
  const renderMarkdown = (content: string) => {
    // Split content by lines
    const lines = content.split('\n');
    
    return (
      <div className="markdown-content">
        {lines.map((line, index) => {
          // Headers
          if (line.startsWith('# ')) {
            return <h1 key={index} className="text-2xl font-bold my-2">{line.substring(2)}</h1>;
          } else if (line.startsWith('## ')) {
            return <h2 key={index} className="text-xl font-bold my-2">{line.substring(3)}</h2>;
          } else if (line.startsWith('### ')) {
            return <h3 key={index} className="text-lg font-bold my-2">{line.substring(4)}</h3>;
          }
          // Lists
          else if (line.startsWith('- ')) {
            return <li key={index} className="ml-4">{line.substring(2)}</li>;
          } 
          // Code blocks
          else if (line.startsWith('```')) {
            return <pre key={index} className="bg-gray-100 dark:bg-gray-800 p-2 rounded my-2">{line}</pre>;
          }
          // Empty lines
          else if (line.trim() === '') {
            return <br key={index} />;
          }
          // Regular text
          else {
            return <p key={index} className="my-1">{line}</p>;
          }
        })}
      </div>
    );
  };

  return (
    <Card className="p-4 shadow-lg bg-white/90 backdrop-blur-sm">
      <h2 className="text-xl font-bold mb-4">System Logs</h2>
      
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <Tabs defaultValue={logFiles[0]?.name || "logs.nd"}>
          <TabsList className="mb-4">
            {logFiles.map((file) => (
              <TabsTrigger key={file.name} value={file.name}>
                {file.name.replace('.nd', '')}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {logFiles.map((file) => (
            <TabsContent key={file.name} value={file.name} className="max-h-80 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 rounded">
              {renderMarkdown(file.content)}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </Card>
  );
};

export default LogsViewer;
