
import { useState, useEffect } from 'react';
import { getServerBasedTime } from '@/services/timeService';

export const useGreeting = (gender: 'female' | 'male') => {
  const [initialGreeting, setInitialGreeting] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Get greeting based on time of day using MCP server
  const getAccurateTimeBasedGreeting = async (): Promise<string> => {
    const name = gender === 'female' ? 'Rósa' : 'Birkir';
    
    // Check if we've already greeted the user in this session
    const sessionGreeted = sessionStorage.getItem(`greeting_${gender}`);
    if (sessionGreeted) {
      console.log("Using cached greeting to prevent repetition");
      return sessionGreeted;
    }
    
    // First try to get an accurate greeting from MCP server
    try {
      const serverTime = await getServerBasedTime();
      if (serverTime) {
        console.log("Using MCP server time-based greeting:", serverTime.greeting);
        const greeting = `${serverTime.greeting}, ég heiti ${name}. Hvernig get ég aðstoðað þig í dag?`;
        
        // Save to session storage to prevent repetition
        sessionStorage.setItem(`greeting_${gender}`, greeting);
        return greeting;
      }
    } catch (error) {
      console.error("Error getting server-based greeting:", error);
    }
    
    // Fallback to local time
    const hour = new Date().getHours();
    let greeting;
    
    if (hour >= 5 && hour < 12) {
      greeting = `Góðan morgun, ég heiti ${name}. Hvernig get ég aðstoðað þig í dag?`;
    } else if (hour >= 12 && hour < 18) {
      greeting = `Góðan dag, ég heiti ${name}. Hvernig get ég aðstoðað þig í dag?`;
    } else if (hour >= 18 && hour < 22) {
      greeting = `Gott kvöld, ég heiti ${name}. Hvernig get ég aðstoðað þig í dag?`;
    } else {
      greeting = `Góða nótt, ég heiti ${name}. Hvernig get ég aðstoðað þig?`;
    }
    
    // Save to session storage to prevent repetition
    sessionStorage.setItem(`greeting_${gender}`, greeting);
    return greeting;
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
