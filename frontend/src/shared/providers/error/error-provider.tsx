"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { ErrorToastContainer } from "@/src/shared/components/error-toast-container";

type ErrorMessage = {
  id: string;
  text: string;
};

type ErrorContextValue = {
  notifyError: (message: string) => void;
};

const ErrorContext = createContext<ErrorContextValue | null>(null);

type ErrorProviderProps = {
  children: ReactNode;
};

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const [messages, setMessages] = useState<ErrorMessage[]>([]);

  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((message) => message.id !== id));
  }, []);

  const notifyError = useCallback(
    (message: string) => {
      const id = generateId();
      setMessages((prev) => [...prev, { id, text: message }]);

      window.setTimeout(() => {
        removeMessage(id);
      }, 5000);
    },
    [removeMessage],
  );

  const value = useMemo<ErrorContextValue>(
    () => ({
      notifyError,
    }),
    [notifyError],
  );

  return (
    <ErrorContext.Provider value={value}>
      {children}
      <ErrorToastContainer messages={messages} onDismiss={removeMessage} />
    </ErrorContext.Provider>
  );
}

export function useErrorNotifications() {
  const context = useContext(ErrorContext);

  if (!context) {
    throw new Error("useErrorNotifications must be used within ErrorProvider");
  }

  return context;
}


