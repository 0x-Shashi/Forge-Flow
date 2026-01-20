'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'rgba(18, 18, 26, 0.95)',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          backdropFilter: 'blur(12px)',
          padding: '12px 16px',
          fontSize: '14px',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
          style: {
            borderColor: 'rgba(16, 185, 129, 0.3)',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
          style: {
            borderColor: 'rgba(239, 68, 68, 0.3)',
          },
        },
        loading: {
          iconTheme: {
            primary: '#8b5cf6',
            secondary: '#fff',
          },
          style: {
            borderColor: 'rgba(139, 92, 246, 0.3)',
          },
        },
      }}
    />
  );
}
