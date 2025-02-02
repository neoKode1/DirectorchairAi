import { useState, useEffect } from 'react';

const FREE_GENERATION_LIMIT = 10;
const GENERATION_COUNT_KEY = 'generation_count';

export function useGenerationLimit() {
  const [generationCount, setGenerationCount] = useState(0);
  const [showSubscription, setShowSubscription] = useState(false);

  useEffect(() => {
    // Load the generation count from localStorage
    const savedCount = localStorage.getItem(GENERATION_COUNT_KEY);
    if (savedCount) {
      setGenerationCount(parseInt(savedCount));
    }
  }, []);

  const incrementCount = () => {
    const newCount = generationCount + 1;
    setGenerationCount(newCount);
    localStorage.setItem(GENERATION_COUNT_KEY, newCount.toString());

    if (newCount >= FREE_GENERATION_LIMIT) {
      setShowSubscription(true);
    }
  };

  const resetCount = () => {
    setGenerationCount(0);
    localStorage.setItem(GENERATION_COUNT_KEY, '0');
  };

  return {
    generationCount,
    showSubscription,
    setShowSubscription,
    incrementCount,
    resetCount,
    hasReachedLimit: generationCount >= FREE_GENERATION_LIMIT
  };
} 