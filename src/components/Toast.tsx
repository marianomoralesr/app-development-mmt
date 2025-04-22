import { Toaster } from 'react-hot-toast';

export function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1a365d',
          color: '#fff',
        },
        success: {
          style: {
            background: '#059669',
          },
        },
        error: {
          style: {
            background: '#dc2626',
          },
          duration: 5000,
        },
      }}
    />
  );
}