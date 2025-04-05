
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface UseGreetingReturn {
  initialGreeting: string;
  isLoading: boolean;
  shouldAutoGreet: boolean; // Flag to control automatic greeting
  hasError: boolean; // Flag to track errors
}

export const useGreeting = (gender: 'female' | 'male'): UseGreetingReturn => {
  const [initialGreeting, setInitialGreeting] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [shouldAutoGreet, setShouldAutoGreet] = useState<boolean>(false); // Default to false - don't auto-greet
  const [hasError, setHasError] = useState<boolean>(false); // Track error state
  
  useEffect(() => {
    const fetchGreeting = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        // Check if the health-check endpoint is available
        try {
          const healthCheck = await fetch('/ai-phone-agent/health-check');
          if (!healthCheck.ok) {
            console.warn('Health check failed, falling back to local greeting');
            throw new Error('Health check failed');
          }
        } catch (healthCheckError) {
          console.error('Health check error:', healthCheckError);
          throw healthCheckError;
        }
        
        // Different greeting templates based on gender
        const name = gender === 'female' ? 'Rósa' : 'Birkir';
        const time = new Date().getHours();
        
        let greeting = '';
        
        // Time-based greeting
        if (time >= 5 && time < 12) {
          greeting = `Góðan daginn, ég heiti ${name} og er aðstoðarmaður Reykjavíkurborgar. Hvernig get ég aðstoðað þig?`;
        } else if (time >= 12 && time < 18) {
          greeting = `Góðan dag, ég heiti ${name} og er aðstoðarmaður Reykjavíkurborgar. Hvernig get ég aðstoðað þig?`;
        } else {
          greeting = `Gott kvöld, ég heiti ${name} og er aðstoðarmaður Reykjavíkurborgar. Hvernig get ég aðstoðað þig?`;
        }
        
        setInitialGreeting(greeting);
        
        // Log successful greeting initialization
        try {
          fetch('/ai-phone-agent/logs.nd', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: 'Greeting initialized successfully',
              timestamp: new Date().toISOString()
            })
          }).catch(() => {
            // Silently fail if server logging fails
          });
        } catch (_) {
          // Ignore logging errors
        }
      } catch (error) {
        console.error('Error fetching greeting:', error);
        setHasError(true);
        
        // Fallback greeting if there's an error
        const name = gender === 'female' ? 'Rósa' : 'Birkir';
        setInitialGreeting(`Góðan dag, ég heiti ${name}. Hvernig get ég aðstoðað þig?`);
        
        // Show toast notification about the error
        toast.error('Villa við að sækja kveðju. Notaður staðbundin kveðja.', {
          duration: 3000
        });
        
        // Log greeting error
        try {
          fetch('/ai-phone-agent/logs.nd', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              error: error?.message || 'Unknown error',
              operation: 'Greeting Initialization',
              timestamp: new Date().toISOString()
            })
          }).catch(() => {
            // Silently fail if server logging fails
          });
        } catch (_) {
          // Ignore logging errors
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGreeting();
  }, [gender]);
  
  return { initialGreeting, isLoading, shouldAutoGreet, hasError };
};
