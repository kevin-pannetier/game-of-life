import { useState } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  onMissingData?: () => void,
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        return JSON.parse(item) as T; // Safely parse existing value
      } else {
        onMissingData?.();
        return initialValue;
      }
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}":`, error);
      onMissingData?.();
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value)); // Safely save value as JSON
    } catch (error) {
      console.error(`Error saving to localStorage for key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
