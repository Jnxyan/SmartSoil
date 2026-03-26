import { useState, useCallback } from 'react';

function useLocalStorage(key, def) {
  const [val, setVal] = useState(() => {
    try { 
      const s = localStorage.getItem(key); 
      return s ? JSON.parse(s) : def; 
    }
    catch { 
      return def; 
    }
  });
  const save = useCallback(v => { setVal(v); try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key]);
  return [val, save];
}

export default useLocalStorage;