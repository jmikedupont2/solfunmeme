'use client';

export default function TestErrorPage() {
  const triggerError = () => {
    throw new Error('Test error from button click');
  };
  
  const triggerPromiseError = () => {
    Promise.reject('Test promise rejection');
  };
  
  const triggerConsoleError = () => {
    console.error('Test console.error message', { foo: 'bar' });
  };
  
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🧪 Error Testing</h1>
        
        <div className="space-y-4">
          <button
            onClick={triggerError}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold block w-full"
          >
            Trigger Error
          </button>
          
          <button
            onClick={triggerPromiseError}
            className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-lg font-bold block w-full"
          >
            Trigger Promise Rejection
          </button>
          
          <button
            onClick={triggerConsoleError}
            className="bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-lg font-bold block w-full"
          >
            Trigger Console Error
          </button>
        </div>
        
        <p className="mt-8 text-gray-400">
          Click any button to trigger an error. Check server logs for error reports.
        </p>
      </div>
    </div>
  );
}
