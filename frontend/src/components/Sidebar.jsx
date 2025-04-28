"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const isActive = (path) => pathname === path || pathname.startsWith(path);

  return (
    <nav className="bg-gray-900 w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-white text-xl font-bold">Banque Rupt</h1>
      </div>
      <ul className="space-y-2">
        <li>
          <Link 
            href="/dashboard" 
            className={`block p-2 rounded ${
              isActive('/dashboard') && 
              !isActive('/dashboard/transactions') && 
              !isActive('/dashboard/transfer') ? 
                'bg-blue-700 text-white' 
              : 'text-gray-300 hover:bg-gray-800'}`}
          >
            Tableau de bord
          </Link>
        </li>
        <li>
          <Link 
            href="/dashboard/transfer" 
            className={`block p-2 rounded ${
              isActive('/dashboard/transfer') ? 
                'bg-blue-700 text-white' 
              : 'text-gray-300 hover:bg-gray-800'}`}
          >
            Effectuer un virement
          </Link>
        </li>
        <li>
          <Link 
            href="/dashboard/transactions" 
            className={`block p-2 rounded ${
              isActive('/dashboard/transactions') ? 
                'bg-blue-700 text-white' 
              : 'text-gray-300 hover:bg-gray-800'}`}
          >
            Historique des transactions
          </Link>
        </li>
        <li>
          <Link 
            href="/dashboard/accounts" 
            className={`block p-2 rounded ${
              isActive('/dashboard/accounts') ? 
                'bg-blue-700 text-white' 
              : 'text-gray-300 hover:bg-gray-800'}`}
          >
            Gestion des comptes
          </Link>
        </li>
        <li>
          <Link 
            href="/dashboard/cards" 
            className={`block p-2 rounded ${
              isActive('/dashboard/cards') ? 
                'bg-blue-700 text-white' 
              : 'text-gray-300 hover:bg-gray-800'}`}
          >
            Gestion des cartes
          </Link>
        </li>
        <li className="mt-8 pt-4 border-t border-gray-700">
          <Link 
            href="/login" 
            className="block p-2 rounded text-gray-300 hover:bg-red-700 hover:text-white"
          >
            Déconnexion
          </Link>
        </li>
      </ul>
    </nav>
  );
}