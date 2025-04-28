import React from 'react';
import './App.css';

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Client Space</h1>

        {/* Money in the account */}
        <div className="mb-6">
          <h2 className="text-lg font-medium">Balance:</h2>
          <p className="text-xl font-bold text-green-600">€0.00</p>
        </div>

        {/* Button to send money */}
        <div className="mb-6">
          <button
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Effectuer un virement
          </button>
        </div>

        {/* Transaction log */}
        <div>
          <h2 className="text-lg font-medium mb-2">Transaction Log:</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>Aucune opération.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
