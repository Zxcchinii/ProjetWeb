"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import accountService from '@/services/accountService';
import transactionService from '@/services/transactionService';
import { formatCurrency } from '@/utils/formatters';

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch accounts and recent transactions in parallel
        const [accountsData, transactionsData] = await Promise.all([
          accountService.getAccounts(),
          transactionService.getTransactions({ limit: 5 })
        ]);
        
        setAccounts(accountsData);
        setTransactions(transactionsData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Impossible de charger les données du tableau de bord');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  if (loading || isLoading) {
    return <div className="text-center p-12">Chargement...</div>;
  }

  // Calculate total balance across all accounts
  const totalBalance = accounts.reduce((sum, account) => sum + parseFloat(account.balance), 0);
  
  // Count accounts by type
  const accountsByType = accounts.reduce((acc, account) => {
    acc[account.type] = (acc[account.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-100">Tableau de bord</h1>
        <p className="text-gray-400">Bienvenue, {user?.first_name}</p>
      </div>
      
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Solde total</h2>
          <p className="text-3xl font-bold text-green-400">{formatCurrency(totalBalance)}</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Comptes</h2>
          <p className="text-3xl font-bold text-blue-400">{accounts.length}</p>
          <div className="mt-2 text-sm text-gray-400">
            {Object.entries(accountsByType).map(([type, count]) => (
              <div key={type} className="flex justify-between">
                <span>{type}:</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Actions rapides</h2>
          <div className="flex flex-col space-y-2">
            <Link href="/dashboard/transfer" className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-center">
              Nouveau virement
            </Link>
            <Link href="/dashboard/accounts" className="text-white bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-center">
              Gérer mes comptes
            </Link>
          </div>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-100">Transactions récentes</h2>
          <Link href="/dashboard/transactions" className="text-blue-400 hover:text-blue-300 text-sm">
            Voir tout
          </Link>
        </div>
        
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                      {transaction.type}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                      {transaction.description}
                    </td>
                    <td className={`px-4 py-2 whitespace-nowrap text-sm ${parseFloat(transaction.amount) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">Aucune transaction récente</p>
        )}
      </div>
      
      {/* Accounts Summary */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-100">Mes comptes</h2>
          <Link href="/dashboard/accounts" className="text-blue-400 hover:text-blue-300 text-sm">
            Voir tout
          </Link>
        </div>
        
        {accounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((account) => (
              <div key={account.id} className="border border-gray-700 rounded p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-200">{account.name || account.type}</h3>
                  <span className="text-xs px-2 py-1 bg-gray-700 rounded-full text-gray-300">{account.type}</span>
                </div>
                <p className="text-gray-400 text-sm mb-2">N° {account.account_number}</p>
                <p className="text-xl font-bold text-green-400">{formatCurrency(account.balance)}</p>
                <Link href={`/dashboard/accounts/${account.id}`} className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block">
                  Détails →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">Aucun compte disponible</p>
        )}
      </div>
    </div>
  );
}