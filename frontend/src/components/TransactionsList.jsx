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
    return <div className="text-center p-4">Chargement des transactions...</div>;
  }
  
  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }
  
  if (transactions.length === 0) {
    return <div className="text-center p-4">Aucune transaction trouvée</div>;
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left">Date</th>
            <th className="py-3 px-4 text-left">Description</th>
            <th className="py-3 px-4 text-left">Compte source</th>
            <th className="py-3 px-4 text-left">Compte destinataire</th>
            <th className="py-3 px-4 text-right">Montant</th>
            <th className="py-3 px-4 text-center">Statut</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {transactions.map(transaction => (
            <tr key={transaction.id} className="hover:bg-gray-50">
              <td className="py-2 px-4">
                {format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
              </td>
              <td className="py-2 px-4">{transaction.description}</td>
              <td className="py-2 px-4">{transaction.fromAccount?.account_number}</td>
              <td className="py-2 px-4">{transaction.toAccount?.account_number}</td>
              <td className="py-2 px-4 text-right">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(transaction.amount)}
              </td>
              <td className="py-2 px-4 text-center">
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                  transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
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