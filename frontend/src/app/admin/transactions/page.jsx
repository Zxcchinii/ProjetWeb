"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import adminService from '@/services/adminService';
import format from 'date-fns/format';
import fr from 'date-fns/locale/fr';

export default function AdminTransactionsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  useEffect(() => {
    // Redirect if not admin
    if (!loading && (!isAuthenticated || (user && user.role !== 'admin'))) {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, user, router]);
  
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await adminService.getTransactions();
        setTransactions(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Erreur lors de la récupération des transactions');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated && user?.role === 'admin') {
      fetchTransactions();
    }
  }, [isAuthenticated, user]);
  
  const handleCancelTransaction = async (transactionId) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette transaction ? Cette action peut affecter les soldes des comptes concernés.')) {
      return;
    }
    
    try {
      setError(null);
      const response = await adminService.cancelTransaction(transactionId);
      
      // Update transaction status in the list
      setTransactions(transactions.map(t => {
        if (t.id === transactionId) {
          return { ...t, status: 'cancelled' };
        }
        return t;
      }));
      
      setSuccess('Transaction annulée avec succès');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error cancelling transaction:', err);
      setError(err.response?.data?.error || 'Erreur lors de l\'annulation de la transaction');
    }
  };
  
  if (loading || (isLoading && !error)) {
    return <div className="text-center p-12">Chargement...</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestion des transactions</h1>
      
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-750">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">De</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vers</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Montant</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-700">
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{transaction.id}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                  {format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300 capitalize">{transaction.type}</td>
                <td className="px-4 py-2 text-sm text-gray-300">
                  {transaction.fromAccount?.account_number || '—'}
                </td>
                <td className="px-4 py-2 text-sm text-gray-300">
                  {transaction.toAccount?.account_number || '—'}
                </td>
                <td className="px-4 py-2 text-sm text-gray-300">
                  {transaction.description}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-300">
                  {parseFloat(transaction.amount).toFixed(2)} €
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    transaction.status === 'completed' ? 'bg-green-900 text-green-300' :
                    transaction.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-red-900 text-red-300'
                  }`}>
                    {transaction.status === 'completed' ? 'Terminé' :
                     transaction.status === 'pending' ? 'En attente' : 'Annulé'}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                  {transaction.status !== 'cancelled' && (
                    <button
                      onClick={() => handleCancelTransaction(transaction.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                    >
                      Annuler
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}