import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
      <h1 className="mb-4 text-5xl font-bold">Vite + React + Tailwind</h1>
      <p className="mb-8 text-lg text-gray-500 dark:text-gray-400">
        Edit <code className="rounded bg-gray-200 px-2 py-1 text-sm dark:bg-gray-700">src/App.jsx</code> and save to
        test HMR
      </p>
      <button
        className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
        onClick={() => setCount((c) => c + 1)}
      >
        Count is {count}
      </button>
    </div>
  );
}

export default App;
