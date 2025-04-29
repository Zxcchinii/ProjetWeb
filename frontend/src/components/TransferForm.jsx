"use client";

import { useState, useEffect } from 'react';
import accountService from '@/services/accountService';
import transactionService from '@/services/transactionService';

export default function TransferForm() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    account_number_from: '',
    account_number_to: '',
    amount: '',
    description: ''
  });
  
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await accountService.getAccounts();
        setAccounts(data);
      } catch (err) {
        setError('Impossible de charger vos comptes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAccounts();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      const amount = parseFloat(formData.amount);
      
      if (isNaN(amount) || amount <= 0) {
        setError('Montant invalide');
        return;
      }
      
      await transactionService.createTransaction({
        ...formData,
        amount: amount
      });
      
      setSuccess('Virement effectué avec succès');
      setFormData({
        account_number_from: '',
        account_number_to: '',
        amount: '',
        description: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du virement');
      console.error(err);
    }
  };
  
  if (loading) {
    return <div className="text-center p-4 text-gray-300">Chargement...</div>;
  }
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-100">Effectuer un virement</h2>
      
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
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Compte source</label>
          <select
            name="account_number_from"
            value={formData.account_number_from}
            onChange={handleChange}
            className="w-full p-2 border border-gray-700 bg-gray-800 text-gray-200 rounded"
            required
          >
            <option value="">Sélectionnez un compte</option>
            {accounts.map(account => (
              <option key={account.id} value={account.account_number}>
                {account.account_number} ({account.type}) - {parseFloat(account.balance).toFixed(2)} €
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Numéro de compte destinataire (IBAN)</label>
          <input
            type="text"
            name="account_number_to"
            value={formData.account_number_to}
            onChange={handleChange}
            placeholder="FR9440327777764766"
            className="w-full p-2 border border-gray-700 bg-gray-800 text-gray-200 rounded placeholder-gray-500"
            required
            pattern="^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$"
            title="Format IBAN valide (ex: FR9440327777764766)"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Montant (€)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full p-2 border border-gray-700 bg-gray-800 text-gray-200 rounded"
            min="0.01"
            step="0.01"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border border-gray-700 bg-gray-800 text-gray-200 rounded placeholder-gray-500"
            placeholder="Description du virement"
          />
        </div>
        
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Effectuer le virement
        </button>
      </form>
    </div>
  );
}