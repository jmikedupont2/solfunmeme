'use client';

import { useEffect } from 'react';

export function ErrorReporter() {
  useEffect(() => {
    console.log('🟢 ErrorReporter initialized');
    
    // Store errors and logs in window - initialize immediately
    if (typeof window !== 'undefined') {
      (window as any).__errorLog = (window as any).__errorLog || [];
      (window as any).__consoleLog = (window as any).__consoleLog || [];
    }
    
    // Catch unhandled errors - capture BEFORE sending
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
      
      // Store first
      (window as any).__errorLog.push(errorData);
      console.log('🔴 Error captured:', errorData.message);
      
      // Then send
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      }).catch(() => {});
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
      
      (window as any).__errorLog.push(errorData);
      console.log('🔴 Rejection captured:', errorData.message);
      
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      }).catch(() => {});
    };
    
    // Intercept console.error - store BEFORE calling original
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args: any[]) => {
      const errorData = {
        type: 'console.error',
        message: args.map(a => String(a)).join(' '),
        stack: new Error().stack,
        url: window.location.href,
        timestamp: Date.now()
      };
      
      (window as any).__consoleLog.push(errorData);
      originalError.apply(console, args);
      
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      }).catch(() => {});
    };
    
    console.warn = (...args: any[]) => {
      const warnData = {
        type: 'console.warn',
        message: args.map(a => String(a)).join(' '),
        timestamp: Date.now()
      };
      
      (window as any).__consoleLog.push(warnData);
      originalWarn.apply(console, args);
    };
    
    window.addEventListener('error', handleError, true); // Use capture phase
    window.addEventListener('unhandledrejection', handleRejection, true);
    
    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleRejection, true);
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);
  
  return null;
}
