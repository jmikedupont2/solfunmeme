'use client';

import { useEffect } from 'react';

export function ErrorReporter() {
  useEffect(() => {
    // Catch unhandled errors
    const handleError = (event: ErrorEvent) => {
      const errorData = {
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        line: event.lineno,
        column: event.colno,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      };
      
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      }).catch(console.error);
    };
    
    // Catch unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      const errorData = {
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        line: 0,
        column: 0,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      };
      
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      }).catch(console.error);
    };
    
    // Catch console.error calls
    const originalError = console.error;
    console.error = (...args: any[]) => {
      originalError(...args);
      
      const errorData = {
        message: args.map(a => String(a)).join(' '),
        stack: new Error().stack,
        url: window.location.href,
        line: 0,
        column: 0,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      };
      
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      }).catch(() => {});
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
      console.error = originalError;
    };
  }, []);
  
  return null;
}
