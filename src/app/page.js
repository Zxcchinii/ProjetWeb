"use client";

import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'; // Import necessary components
import logo from './cat.svg'; // Assuming cat.svg is in the same folder or adjust the path accordingly
import './App.css';
import LoginPage from './loginPage'; // Import the login page component
import RegisterPage from './register';


function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        {/* Top white section */}
        <header className="bg-white shadow-md py-4 px-6 flex items-center justify-between">
          {/* Logo on the top left */}
          <img src={logo} alt="Cat Logo" className="w-12 h-12" />

          {/* Bank name in the middle */}
          <h1 className="text-2xl font-bold text-gray-800">Banque Rupt</h1>

          {/* Espace Client button */}
          <Link to="/loginPage">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Espace Client
            </button>
          </Link>
        </header>

        {/* Main content */}
        <main className="flex items-center justify-center h-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/loginPage" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function Home() {
  return <p className="text-gray-700 text-lg">_</p>;
}

export default App;