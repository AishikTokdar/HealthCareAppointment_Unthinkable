import { useState, useCallback } from 'react';

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, duration);
  }, []);

  return { toast, showToast, hideToast: () => setToast(null) };
}
