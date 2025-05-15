
import { Toast, ToastActionElement, ToastProps } from '@/components/ui/toast';
import * as React from "react";

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToastState = {
  toasts: ToasterToast[];
};

import {
  createContext,
  useContext,
  useState,
} from 'react';

const ToastContext = createContext<{
  toasts: ToasterToast[];
  addToast: (toast: ToasterToast) => void;
  removeToast: (id: string) => void;
} | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return {
    ...context,
    toast: (props: Omit<ToasterToast, "id"> & { id?: string }) => {
      context.addToast({
        ...props,
        id: props.id ?? Math.random().toString(),
      } as ToasterToast);
    },
  };
};

// Simple toast function for direct usage
export const toast = (props: Omit<ToasterToast, "id"> & { id?: string }) => {
  const context = useContext(ToastContext);
  
  if (context) {
    context.addToast({
      ...props,
      id: props.id ?? Math.random().toString(),
    } as ToasterToast);
  }
};

export const ToastProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [toasts, setToasts] = useState<ToasterToast[]>([]);

  const addToast = (toast: ToasterToast) => {
    setToasts((prevToasts) => {
      if (prevToasts.length >= TOAST_LIMIT) {
        return [...prevToasts.slice(1), toast];
      }
      return [...prevToasts, toast];
    });
  };

  const removeToast = (id: string) => {
    setToasts((prevToasts) =>
      prevToasts.filter((toast) => toast.id !== id),
    );
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};
