"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import accountService from '@/services/accountService';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [newType, setNewType] = useState('courant');
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const data = await accountService.getAccounts();
      setAccounts(data);
    } catch (e) {
      setError('Impossible de charger les comptes');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await accountService.createAccount(newType);
      setNewType('courant');
      fetchAccounts();
    } catch (e) {
      setError('Erreur création compte');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce compte ?')) return;
    try {
      await accountService.deleteAccount(id);
      setAccounts(accounts.filter(a => a.id !== id));
    } catch (e) {
      setError('Erreur suppression compte');
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
      <h1 className="text-2xl font-bold text-gray-100 mb-4">Gestion des comptes</h1>
      {error && <div className="text-red-400 mb-4">{error}</div>}

      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <select
          value={newType}
          onChange={e => setNewType(e.target.value)}
          className="bg-gray-700 text-gray-100 border border-gray-600 p-2 rounded"
        >
          <option value="courant">Courant</option>
          <option value="epargne">Épargne</option>
          <option value="entreprise">Entreprise</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Créer
        </button>
      </form>

      <table className="w-full text-left text-gray-200">
        <thead className="border-b border-gray-600">
          <tr>
            <th className="py-2">ID</th>
            <th>Numéro</th>
            <th>Type</th>
            <th>Solde</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {accounts.map(a => (
            <tr key={a.id} className="hover:bg-gray-700">
              <td className="py-2">{a.id}</td>
              <td>
                <button
                  onClick={() => router.push(`/dashboard/accounts/${a.id}`)}
                  className="text-blue-400 hover:underline"
                >
                  {a.account_number}
                </button>
              </td>
              <td>{a.type}</td>
              <td>{parseFloat(a.balance).toFixed(2)} €</td>
              <td>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-red-500 hover:underline"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}