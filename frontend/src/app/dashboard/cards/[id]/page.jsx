"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import cardService from '@/services/cardService';

export default function CardDetailPage() {
  const { id } = useParams();
  const [card, setCard] = useState(null);
  const [status, setStatus] = useState('');
  const [limit, setLimit] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const data = await cardService.getAll(); 
        const sel = data.find(c => c.id === parseInt(id));
        setCard(sel);
        setStatus(sel.status);
        setLimit(sel.daily_limit);
      } catch {
        setError('Impossible de charger');
      }
    })();
  }, [id]);

  const save = async () => {
    try {
      await cardService.updateStatus(id, status);
      await cardService.updateLimit(id, limit);
      router.back();
    } catch {
      setError('Erreur sauvegarde');
    }
  };

  const suppr = async () => {
    if (!confirm('Supprimer cette carte ?')) return;
    await cardService.delete(id);
    router.push('/dashboard/cards');
  };

  if (!card) return <div className="text-gray-300">Chargement…</div>;

  return (
    <div className="bg-gray-800 p-6 rounded shadow border border-gray-700 max-w-md mx-auto space-y-4">
      <h1 className="text-xl text-gray-100">Carte #{card.id}</h1>
      {error && <div className="text-red-400">{error}</div>}

      <p className="text-gray-200"><strong>Compte:</strong> {card.Account.account_number}</p>
      <p className="text-gray-200"><strong>Type:</strong> {card.card_type}</p>

      <div className="space-y-2">
        <label className="text-gray-300">Statut</label>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="bg-gray-700 text-gray-200 border border-gray-600 p-2 rounded w-full"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="blocked">Bloquée</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-gray-300">Plafond</label>
        <input
          type="number"
          value={limit}
          onChange={e => setLimit(e.target.value)}
          className="bg-gray-700 text-gray-200 border border-gray-600 p-2 rounded w-full"
        />
      </div>

      <div className="flex justify-between">
        <button onClick={save} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Sauvegarder
        </button>
        <button onClick={suppr} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
          Supprimer
        </button>
      </div>
    </div>
  );
}