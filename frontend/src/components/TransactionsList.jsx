"use client";

import { useState, useEffect } from 'react';
import transactionService from '@/services/transactionService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function TransactionsList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await transactionService.getTransactions();
        setTransactions(data);
      } catch (err) {
        setError('Impossible de charger vos transactions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, []);
  
  if (loading) {
    return <div className="text-center p-4 text-gray-300">Chargement des transactions...</div>;
  }
  
  if (error) {
    return <div className="text-center text-red-400 p-4">{error}</div>;
  }
  
  if (transactions.length === 0) {
    return <div className="text-center p-4 text-gray-300">Aucune transaction trouvée</div>;
  }
  
  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full bg-gray-800 border border-gray-700">
        <thead className="bg-gray-900">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Compte source</th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Compte destinataire</th>
            <th className="py-3 px-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Montant</th>
            <th className="py-3 px-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Statut</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {transactions.map(transaction => (
            <tr key={transaction.id} className="hover:bg-gray-700 transition-colors">
              <td className="py-2 px-4 text-gray-300">
                {format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
              </td>
              <td className="py-2 px-4 text-gray-300">{transaction.description}</td>
              <td className="py-2 px-4 text-gray-300">{transaction.fromAccount?.account_number}</td>
              <td className="py-2 px-4 text-gray-300">{transaction.toAccount?.account_number}</td>
              <td className="py-2 px-4 text-right text-gray-300">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(transaction.amount)}
              </td>
              <td className="py-2 px-4 text-center">
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  transaction.status === 'completed' ? 'bg-green-900 text-green-300' :
                  transaction.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                  'bg-red-900 text-red-300'
                }`}>
                  {transaction.status === 'completed' ? 'Terminé' :
                   transaction.status === 'pending' ? 'En attente' : 'Annulé'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}