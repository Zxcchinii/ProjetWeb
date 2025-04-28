"use client";

import React from 'react';
import './App.css';

function AnotherPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4 text-center">Création de compte</h1>
        <div className="mb-4">
          <textarea
            placeholder="Nom d'utilisateur"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
          ></textarea>
        </div>
        <div className="mb-4">
          <textarea
            placeholder="Mot de passe"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
          ></textarea>
        </div>
        <button
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Créer un compte
        </button>
      </div>
    </div>
  );
}

export default AnotherPage;
