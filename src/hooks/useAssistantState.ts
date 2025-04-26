
import { useState } from 'react';

export const useAssistantState = () => {
  const [initialGreetingDone, setInitialGreetingDone] = useState<boolean>(false);
  const [userHasGreeted, setUserHasGreeted] = useState<boolean>(false);

  return {
    initialGreetingDone,
    setInitialGreetingDone,
    userHasGreeted,
    setUserHasGreeted
  };
};

