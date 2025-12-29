import { useState, useEffect } from 'react';

// Debounces a value — returns the latest value only after `delay` ms of inactivity
export default function useDebounce(value, delay = 500) {
         const [debouncedValue, setDebouncedValue] = useState(value);

         useEffect(() => {
                  const handler = setTimeout(() => setDebouncedValue(value), delay);
                  return () => clearTimeout(handler);
         }, [value, delay]);

         return debouncedValue;
}
