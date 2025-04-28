"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 shadow-md py-4 px-6 flex items-center justify-between">
        <Image src="/cat.svg" alt="Cat Logo" width={48} height={48} />
        <h1 className="text-2xl font-bold text-gray-100">Banque Rupt</h1>
        <Link 
          href="/login"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Espace Client
        </Link>
      </header>
      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-white">Bienvenue à votre banque en ligne</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            {/* Content */}
          </p>
        </section>
        {/* Rest of content */}
      </main>
    </div>
  );
}