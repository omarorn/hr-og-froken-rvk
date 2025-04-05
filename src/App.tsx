
import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';

import { Toaster } from "sonner";
import { router } from './router';
import { Button } from './components/ui/button';
import { runApiTest } from './services/straeto/apiTester';
import { toast } from './components/ui/use-toast';

function App() {
  // Check server status on load
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch('/ai-phone-agent/health-check');
        if (!response.ok) {
          console.warn('AI Phone Agent server may not be running');
        } else {
          console.log('AI Phone Agent server is online');
        }
      } catch (error) {
        console.warn('Could not connect to AI Phone Agent server:', error);
      }
    };
    
    checkServerStatus();
  }, []);

  const handleTestApi = async () => {
    toast({
      title: "API Test Started",
      description: "Testing Straeto API endpoints. Check console for details.",
    });
    
    try {
      await runApiTest();
      toast({
        title: "API Test Complete",
        description: "Check browser console for detailed results.",
      });
    } catch (error) {
      toast({
        title: "API Test Failed",
        description: "An unexpected error occurred during testing.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={handleTestApi} variant="outline" className="bg-gray-100">
          Test Straeto API
        </Button>
      </div>
      
      <RouterProvider router={router} />
      <Toaster />
    </div>
  );
}

export default App;
