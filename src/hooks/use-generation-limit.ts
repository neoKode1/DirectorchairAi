import { useState } from "react";

const FREE_GENERATION_LIMIT = 10;
const GENERATION_COUNT_KEY = "generation_count";

export function useGenerationLimit() {
  const [showSubscription, setShowSubscription] = useState(false);
  const [count, setCount] = useState(0);

  // Temporarily bypass subscription check
  const incrementCount = async () => {
    // Disabled for testing
    return true;
  };

  return {
    count,
    showSubscription,
    setShowSubscription,
    incrementCount,
  };
}
