
import { useState, useEffect } from 'react';

interface UseGreetingReturn {
  initialGreeting: string;
  isLoading: boolean;
  shouldAutoGreet: boolean; // Add a flag to control automatic greeting
}

export const useGreeting = (gender: 'female' | 'male'): UseGreetingReturn => {
  const [initialGreeting, setInitialGreeting] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [shouldAutoGreet, setShouldAutoGreet] = useState<boolean>(false); // Default to false
  
  useEffect(() => {
    const fetchGreeting = async () => {
      try {
        setIsLoading(true);
        
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
      } catch (error) {
        console.error('Error fetching greeting:', error);
        // Fallback greeting if there's an error
        const name = gender === 'female' ? 'Rósa' : 'Birkir';
        setInitialGreeting(`Góðan dag, ég heiti ${name}. Hvernig get ég aðstoðað þig?`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGreeting();
  }, [gender]);
  
  return { initialGreeting, isLoading, shouldAutoGreet };
};
