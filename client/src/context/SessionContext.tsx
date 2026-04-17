import { createContext, useContext, useEffect, useState } from 'react';

interface SessionContextValue {
  sessionId: string | null;
}

const SessionContext = createContext<SessionContextValue>({ sessionId: null });

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('session_id');
    if (stored) {
      setSessionId(stored);
      return;
    }

    fetch('/api/sessions', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.session_id) {
          sessionStorage.setItem('session_id', data.session_id);
          setSessionId(data.session_id);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <SessionContext.Provider value={{ sessionId }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
