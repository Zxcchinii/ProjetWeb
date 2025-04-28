"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import accountService from '@/services/accountService';

export default function AccountDetailPage() {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [type, setType] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const data = await accountService.getAccountDetails(id);
      setAccount(data);
      setType(data.type);
    } catch {
      setError('Impossible de charger le compte');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await accountService.updateAccount(id, { type });
      fetchDetail();
    } catch {
      setError('Erreur mise à jour');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer ce compte ?')) return;
    try {
      await accountService.deleteAccount(id);
      router.push('/dashboard/accounts');
    } catch {
      setError('Erreur suppression');
    }
  };

  if (!account) {
    return <div className="text-gray-300">Chargement…</div>;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700 max-w-md mx-auto">
      <h1 className="text-2xl text-gray-100 mb-4">Compte #{account.id}</h1>
      {error && <div className="text-red-400 mb-4">{error}</div>}

      <p className="text-gray-200 mb-2"><strong>Numéro:</strong> {account.account_number}</p>
      <p className="text-gray-200 mb-4"><strong>Solde:</strong> {parseFloat(account.balance).toFixed(2)} €</p>

      <form onSubmit={handleUpdate} className="mb-4">
        <label className="block text-gray-300 mb-1">Type de compte</label>
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="bg-gray-700 text-gray-100 border border-gray-600 p-2 rounded w-full"
        >
          <option value="courant">Courant</option>
          <option value="epargne">Épargne</option>
          <option value="entreprise">Entreprise</option>
        </select>
        <button
          type="submit"
          className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Mettre à jour
        </button>
      </form>

      <button
        onClick={handleDelete}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
      >
        Supprimer le compte
      </button>
    </div>
  );
}