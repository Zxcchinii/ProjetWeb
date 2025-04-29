"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import adminService from '@/services/adminService';

export default function AdminAccountsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // For operations
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [amount, setAmount] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [operationType, setOperationType] = useState('');
  
  useEffect(() => {
    // Redirect if not admin
    if (!loading && (!isAuthenticated || (user && user.role !== 'admin'))) {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, user, router]);
  
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await adminService.getAccounts();
        setAccounts(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching accounts:', err);
        setError('Erreur lors de la récupération des comptes');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated && user?.role === 'admin') {
      fetchAccounts();
    }
  }, [isAuthenticated, user]);
  
  const handleOperation = (accountId, operation) => {
    setSelectedAccount(accountId);
    setOperationType(operation);
    setAmount('');
    setShowModal(true);
  };
  
  const handleSubmitOperation = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        setError('Veuillez entrer un montant valide');
        return;
      }
      
      let response;
      if (operationType === 'credit') {
        response = await adminService.creditAccount(selectedAccount, amount);
      } else if (operationType === 'debit') {
        response = await adminService.debitAccount(selectedAccount, amount);
      }
      
      // Update the account in the list
      setAccounts(accounts.map(acc => {
        if (acc.id === selectedAccount) {
          return { ...acc, balance: response.newBalance };
        }
        return acc;
      }));
      
      setSuccess(response.message);
      setShowModal(false);
      
    } catch (err) {
      console.error('Operation error:', err);
      setError(err.response?.data?.error || 'Une erreur est survenue');
    }
  };
  
  const handleDeleteAccount = async (accountId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce compte ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      await adminService.deleteAccount(accountId);
      setAccounts(accounts.filter(acc => acc.id !== accountId));
      setSuccess('Compte supprimé avec succès');
    } catch (err) {
      console.error('Delete account error:', err);
      setError(err.response?.data?.error || 'Erreur lors de la suppression du compte');
    }
  };
  
  if (loading || (isLoading && !error)) {
    return <div className="text-center p-12">Chargement...</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestion des comptes</h1>
      
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Numéro</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Solde</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Propriétaire</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {accounts.map((account) => (
              <tr key={account.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{account.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{account.account_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">{account.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {parseFloat(account.balance).toFixed(2)} €
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {account.User ? `${account.User.first_name} ${account.User.last_name}` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                  <button 
                    onClick={() => handleOperation(account.id, 'credit')}
                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                  >
                    Ajouter
                  </button>
                  <button 
                    onClick={() => handleOperation(account.id, 'debit')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-xs"
                  >
                    Retirer
                  </button>
                  <button 
                    onClick={() => handleDeleteAccount(account.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Modal for Credit/Debit Operations */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">
              {operationType === 'credit' ? 'Ajouter des fonds' : 'Retirer des fonds'}
            </h2>
            
            <form onSubmit={handleSubmitOperation}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Montant (€)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2 border border-gray-700 bg-gray-700 rounded text-white"
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={`${
                    operationType === 'credit' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-yellow-600 hover:bg-yellow-700'
                  } text-white px-4 py-2 rounded`}
                >
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}