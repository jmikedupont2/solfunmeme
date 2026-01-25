'use client';

import { useState } from 'react';

export default function TestWitnessPage() {
  const [error, setError] = useState('');

  const triggerError = () => {
    throw new Error('Test error from button click!');
  };

  const triggerConsoleError = () => {
    console.error('Test console.error message');
    setError('Console error triggered - check witness button');
  };

  const triggerWarning = () => {
    console.warn('Test console.warn message');
    setError('Console warning triggered - check witness button');
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">🧪 Test Witness Button</h1>
        <p className="text-gray-400 mb-8">
          Click buttons to generate errors, then click the eye button (bottom-right) to capture witness data.
        </p>

        <div className="space-y-4">
          <button
            onClick={triggerConsoleError}
            className="w-full bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold"
          >
            Trigger Console Error
          </button>

          <button
            onClick={triggerWarning}
            className="w-full bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-lg font-bold"
          >
            Trigger Console Warning
          </button>

          <button
            onClick={triggerError}
            className="w-full bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold"
          >
            Trigger JavaScript Error (will crash)
          </button>

          {error && (
            <div className="bg-green-900 border border-green-600 p-4 rounded">
              <p className="text-green-200">{error}</p>
              <p className="text-sm text-green-400 mt-2">
                Now click the eye button → to capture witness data
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">How to Test:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Click one of the buttons above to generate an error</li>
            <li>Click the purple eye button in the bottom-right corner</li>
            <li>The witness data will be copied to clipboard (or shown in prompt)</li>
            <li>Paste the data URL here in chat</li>
            <li>I'll decode it and show you the captured errors</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
