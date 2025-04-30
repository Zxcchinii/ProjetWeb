"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const { logout, user } = useAuth();
  const pathname = usePathname();
  const isAdmin = user?.role === 'admin';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Close sidebar when route changes (for mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Improved active link detection
  const isActive = (path) => {
    // For the main dashboard, require exact match
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    // For other pages, check if the current path starts with the given path
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded bg-gray-800 text-white lg:hidden"
        aria-label="Toggle menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`bg-gray-800 w-64 min-h-screen p-4 fixed top-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-bold text-white">Banking App</h1>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 text-gray-300 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav>
          <ul className="space-y-2">
            <li>
              <Link 
                href="/dashboard" 
                className={`block p-2 rounded ${
                  isActive('/dashboard') ? 
                    'bg-blue-700 text-white' 
                  : 'text-gray-300 hover:bg-gray-800'
                }`}
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
            
            {/* Admin Menu Section - Only visible for admin users */}
            {isAdmin && (
              <>
                <li className="mt-8 pt-4 border-t border-gray-700">
                  <h2 className="text-gray-400 uppercase text-sm font-semibold mb-2">Administration</h2>
                </li>
                <li>
                  <Link 
                    href="/admin/dashboard" 
                    className={`block p-2 rounded ${
                      isActive('/admin/dashboard') ? 
                        'bg-blue-700 text-white' 
                      : 'text-gray-300 hover:bg-gray-800'}`}
                  >
                    Tableau Admin
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/users" 
                    className={`block p-2 rounded ${
                      isActive('/admin/users') ? 
                        'bg-blue-700 text-white' 
                      : 'text-gray-300 hover:bg-gray-800'}`}
                  >
                    Gestion Utilisateurs
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/accounts" 
                    className={`block p-2 rounded ${
                      isActive('/admin/accounts') ? 
                        'bg-blue-700 text-white' 
                      : 'text-gray-300 hover:bg-gray-800'}`}
                  >
                    Tous les comptes
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/transactions" 
                    className={`block p-2 rounded ${
                      isActive('/admin/transactions') ? 
                        'bg-blue-700 text-white' 
                      : 'text-gray-300 hover:bg-gray-800'}`}
                  >
                    Gestion des transactions
                  </Link>
                </li>
              </>
            )}
            
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
      </div>
    </>
  );
}