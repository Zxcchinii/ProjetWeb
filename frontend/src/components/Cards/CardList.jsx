import { useState } from 'react';
import Image from 'next/image';
import visaLogo from '../../../public/visa.svg'; // Make sure this path is correct
import mastercardLogo from '../../../public/mastercard.svg';
import cardService from '@/services/cardService';

export default function CardList({ cards, accounts, onUpdateStatus, onUpdateLimit, onUpdate }) {
  const [editingLimitCard, setEditingLimitCard] = useState(null);
  const [newLimit, setNewLimit] = useState('');

  const getAccountNumber = (accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.account_number : 'Compte inconnu';
  };

  const formatCardNumber = (number) => {
    return `${number.substring(0, 4)} **** **** ${number.substring(12)}`;
  };

  const formatExpirationDate = (dateString) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${year}`;
  };

  const getCardLogo = (type) => {
    switch(type.toLowerCase()) {
      case 'visa': 
        return <Image src="/visa.svg" alt="Visa" width={50} height={30} />;
      case 'mastercard': 
        return <Image src="/mastercard.svg" alt="Mastercard" width={50} height={30} />;
      case 'amex': 
        return <Image src="/amex.svg" alt="American Express" width={50} height={30} />;
      default: 
        return null;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-500';
      case 'inactive': return 'bg-yellow-500/20 text-yellow-500';
      case 'blocked': return 'bg-red-500/20 text-red-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'blocked': return 'Bloquée';
      default: return 'Inconnu';
    }
  };

  const handleLimitSubmit = (cardId) => {
    const limitValue = parseFloat(newLimit);
    if (isNaN(limitValue) || limitValue < 0) return;
    
    onUpdateLimit(cardId, limitValue);
    setEditingLimitCard(null);
    setNewLimit('');
  };

  const handleDeleteCard = async (cardId) => {
    try {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte?')) {
        return;
      }
      
      const response = await cardService.deleteCard(cardId);
      
      // Show success message
      alert('Carte supprimée avec succès');
      
      // Call onUpdate to refresh the card list
      if (typeof onUpdate === 'function') {
        onUpdate();
      } else {
        // If onUpdate isn't available, refresh the page as fallback
        window.location.reload();
      }
    } catch (error) {
      console.error('Error deleting card:', error ? error.toString() : 'Unknown error');
      alert('Impossible de supprimer la carte');
    }
  };

  return (
    <div className="space-y-6">
      {cards.map(card => (
        <div key={card.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          {/* Card Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-xl capitalize">{card.card_type}</h3>
                <p className="text-gray-400 text-sm">
                  {getAccountNumber(card.account_id)}
                </p>
              </div>
              <div className="h-8 w-12 relative">
                {getCardLogo(card.card_type)}
              </div>
            </div>
          </div>

          {/* Card Details */}
          <div className="p-6 space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-400">Numéro de carte</p>
                <p className="font-mono">{formatCardNumber(card.card_number)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Expiration</p>
                <p>{formatExpirationDate(card.expiration_date)}</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-400">Statut</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(card.status)}`}>
                  {getStatusLabel(card.status)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Limite quotidienne</p>
                {editingLimitCard === card.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newLimit}
                      onChange={(e) => setNewLimit(e.target.value)}
                      className="w-24 p-1 text-sm rounded bg-gray-700 border border-gray-600"
                    />
                    <button 
                      onClick={() => handleLimitSubmit(card.id)}
                      className="bg-green-600 text-white text-sm p-1 rounded"
                    >
                      ✓
                    </button>
                    <button 
                      onClick={() => setEditingLimitCard(null)}
                      className="bg-red-600 text-white text-sm p-1 rounded"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <p className="font-semibold">
                    {card.daily_limit ? 
                      (typeof card.daily_limit === 'number' 
                        ? card.daily_limit.toFixed(2) 
                        : parseFloat(card.daily_limit).toFixed(2)) 
                      : '0.00'} €
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Card Actions */}
          <div className="p-6 bg-gray-750 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setEditingLimitCard(card.id === editingLimitCard ? null : card.id)}
                className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
              >
                Modifier limite
              </button>
              
              <div className="space-x-2">
                {card.status === 'active' && (
                  <>
                    <button
                      onClick={() => onUpdateStatus(card.id, 'inactive')}
                      className="text-sm bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded"
                    >
                      Désactiver
                    </button>
                    <button
                      onClick={() => onUpdateStatus(card.id, 'blocked')}
                      className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                    >
                      Bloquer
                    </button>
                  </>
                )}
                
                {card.status === 'inactive' && (
                  <button
                    onClick={() => onUpdateStatus(card.id, 'active')}
                    className="text-sm bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                  >
                    Activer
                  </button>
                )}
                
                {card.status === 'blocked' && (
                  <span className="text-sm text-gray-400">Carte bloquée définitivement</span>
                )}
              </div>

              <button 
                onClick={() => handleDeleteCard(card.id)}
                className="text-red-500 hover:text-red-700 ml-2"
                aria-label="Supprimer la carte"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}