"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import cardService from '@/services/cardService';
import accountService from '@/services/accountService';
import CardList from '@/components/Cards/CardList';
import CardForm from '@/components/Cards/CardForm';

export default function CardsPage() {
  const [cards, setCards] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cardsData, accountsData] = await Promise.all([
        cardService.getAll(),
        accountService.getAccounts()
      ]);
      setCards(cardsData);
      setAccounts(accountsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCard = async (cardData) => {
    try {
      console.log("Creating card with data:", cardData);
      const result = await cardService.create(cardData);
      console.log("Card creation result:", result);
      setShowCreateForm(false);
      
      // Add a small delay before refreshing data
      setTimeout(() => {
        fetchData();
      }, 500);
    } catch (error) {
      console.error("Error creating card:", error);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await cardService.updateStatus(id, status);
      fetchData(); // Refresh the card list
    } catch (error) {
      console.error("Error updating card status:", error);
    }
  };

  const handleUpdateLimit = async (id, dailyLimit) => {
    try {
      await cardService.updateLimit(id, dailyLimit);
      fetchData(); // Refresh the card list
    } catch (error) {
      console.error("Error updating card limit:", error);
    }
  };

  const handleCardUpdate = () => {
    fetchData(); // Or whatever function you use to load cards
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mes Cartes Bancaires</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Nouvelle Carte
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : (
        <>
          {showCreateForm && (
            <CardForm
              accounts={accounts}
              onSubmit={handleCreateCard}
              onCancel={() => setShowCreateForm(false)}
            />
          )}

          {cards.length > 0 ? (
            <CardList 
              cards={cards} 
              accounts={accounts}
              onUpdateStatus={handleUpdateStatus}
              onUpdateLimit={handleUpdateLimit}
              onUpdate={handleCardUpdate} 
            />
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-lg mb-4">Vous n'avez pas encore de carte bancaire</p>
              {!showCreateForm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Créer ma première carte
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}