'use client';

import { useState } from 'react';

export default function WitnessButton() {
  const [capturing, setCapturing] = useState(false);

  const captureWitness = async () => {
    setCapturing(true);
    
    try {
      // Collect all witness data
      const witness = {
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        errors: (window as any).__errorLog || [],
        console: (window as any).__consoleLog || [],
        performance: {
          navigation: performance.getEntriesByType('navigation')[0],
          resources: performance.getEntriesByType('resource').slice(-10)
        },
        localStorage: Object.keys(localStorage).reduce((acc, key) => {
          acc[key] = localStorage.getItem(key);
          return acc;
        }, {} as Record<string, string | null>),
        dom: {
          title: document.title,
          bodyClasses: document.body.className,
          scripts: Array.from(document.scripts).map(s => s.src).filter(Boolean).slice(-5)
        }
      };

      // Create data URL
      const json = JSON.stringify(witness, null, 2);
      const dataUrl = `data:application/json;base64,${btoa(json)}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(dataUrl);
      
      alert('✅ Witness captured and copied to clipboard!\nPaste it in chat.');
      
    } catch (err) {
      console.error('Witness capture failed:', err);
      alert('❌ Failed to capture witness: ' + (err as Error).message);
    } finally {
      setCapturing(false);
    }
  };

  return (
    <button
      onClick={captureWitness}
      disabled={capturing}
      className="fixed bottom-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg transition-all hover:scale-110 disabled:opacity-50"
      title="Capture Witness Report"
    >
      <svg width="32" height="32" viewBox="0 0 100 100" className="animate-pulse">
        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="50" cy="50" r="15" fill="currentColor" />
        <circle cx="50" cy="50" r="8" fill="white" />
      </svg>
    </button>
  );
}
