'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import accountService from '@/services/accountService';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await accountService.getAccounts();
        setAccounts(data);
      } catch (err) {
        console.error('Error fetching accounts:', err);
        setError('Impossible de charger vos comptes');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchAccounts();
    }
  }, [isAuthenticated]);

  if (loading || !isAuthenticated) {
    return <div className="text-center p-12">Chargement...</div>;
  }

  // Add dark mode classes
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-100">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Solde total</h2>
          {/* Other content */}
        </div>
        
        {/* Other cards */}
      </div>
    </div>
  );
}