
import { useState, useEffect } from 'react';
import { getServerBasedTime } from '@/services/timeService';

export const useGreeting = (gender: 'female' | 'male') => {
  const [initialGreeting, setInitialGreeting] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Get greeting based on time of day using MCP server
  const getAccurateTimeBasedGreeting = async (): Promise<string> => {
    const name = gender === 'female' ? 'Rósa' : 'Birkir';
    
    // First try to get an accurate greeting from MCP server
    try {
      const serverTime = await getServerBasedTime();
      if (serverTime) {
        console.log("Using MCP server time-based greeting:", serverTime.greeting);
        return `${serverTime.greeting}, ég heiti ${name}. Hvernig get ég aðstoðað þig í dag?`;
      }
    } catch (error) {
      console.error("Error getting server-based greeting:", error);
    }
    
    // Fallback to local time
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return `Góðan morgun, ég heiti ${name}. Hvernig get ég aðstoðað þig í dag?`;
    } else if (hour >= 12 && hour < 18) {
      return `Góðan dag, ég heiti ${name}. Hvernig get ég aðstoðað þig í dag?`;
    } else if (hour >= 18 && hour < 22) {
      return `Gott kvöld, ég heiti ${name}. Hvernig get ég aðstoðað þig í dag?`;
    } else {
      return `Góða nótt, ég heiti ${name}. Hvernig get ég aðstoðað þig?`;
    }
  };

  useEffect(() => {
    const loadGreeting = async () => {
      setIsLoading(true);
      const greeting = await getAccurateTimeBasedGreeting();
      setInitialGreeting(greeting);
      setIsLoading(false);
    };
    
    loadGreeting();
  }, [gender]);

  return {
    initialGreeting,
    isLoading
  };
};
