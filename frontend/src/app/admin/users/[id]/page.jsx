"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import adminService from '@/services/adminService';

export default function UserDetailsPage() {
  const { user: currentUser, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  useEffect(() => {
    if (!loading && (!isAuthenticated || (currentUser && currentUser.role !== 'admin'))) {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, currentUser, router]);
  
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const data = await adminService.getUserDetails(params.id);
        setUser(data);
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated && currentUser?.role === 'admin' && params.id) {
      fetchUserDetails();
    }
  }, [isAuthenticated, currentUser, params.id]);

  const handleDeleteUser = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await adminService.deleteUser(user.id);
        setMessage({ text: 'Utilisateur supprimé avec succès', type: 'success' });
        setTimeout(() => router.push('/admin/users'), 2000); // Redirect after 2 seconds
      } catch (error) {
        console.error('Error deleting user:', error);
        setMessage({ text: 'Erreur lors de la suppression de l\'utilisateur', type: 'error' });
      }
    }
  };

  const handlePromoteToAdmin = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir promouvoir cet utilisateur en tant qu\'administrateur ?')) {
      try {
        await adminService.promoteToAdmin(user.id);
        setUser({ ...user, role: 'admin' });
        setMessage({ text: 'Utilisateur promu administrateur avec succès', type: 'success' });
      } catch (error) {
        console.error('Error promoting user:', error);
        setMessage({ text: 'Erreur lors de la promotion de l\'utilisateur', type: 'error' });
      }
    }
  };
  
  if (loading || isLoading || !currentUser || currentUser.role !== 'admin') {
    return <div className="text-center p-12">Chargement...</div>;
  }

  if (!user) {
    return <div className="text-center p-12">Utilisateur non trouvé</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Détails de l'utilisateur</h1>
        <Link href="/admin/users" className="text-blue-400 hover:text-blue-300">
          Retour à la liste
        </Link>
      </div>
      
      {message.text && (
        <div className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}>
          {message.text}
        </div>
      )}
      
      <div className="bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400">ID:</span> {user.id}
              </div>
              <div>
                <span className="text-gray-400">Nom:</span> {user.last_name}
              </div>
              <div>
                <span className="text-gray-400">Prénom:</span> {user.first_name}
              </div>
              <div>
                <span className="text-gray-400">Email:</span> {user.email}
              </div>
              <div>
                <span className="text-gray-400">Rôle:</span> {user.role}
              </div>
              <div>
                <span className="text-gray-400">Date de création:</span> {new Date(user.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Comptes</h2>
            {user.Accounts && user.Accounts.length > 0 ? (
              <ul className="space-y-3">
                {user.Accounts.map(account => (
                  <li key={account.id} className="bg-gray-700 p-3 rounded">
                    <div><span className="text-gray-400">ID:</span> {account.id}</div>
                    <div><span className="text-gray-400">Type:</span> {account.type}</div>
                    <div><span className="text-gray-400">Solde:</span> {parseFloat(account.balance).toFixed(2)}€</div>
                    <Link href={`/admin/accounts/${account.id}`} className="text-blue-400 hover:text-blue-300 mt-2 inline-block">
                      Voir le compte
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Aucun compte associé</p>
            )}
          </div>
        </div>
        
        <div className="mt-8 space-x-4">
          <button 
            onClick={handleDeleteUser}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Supprimer l'utilisateur
          </button>
          
          {user.role !== 'admin' && (
            <button 
              onClick={handlePromoteToAdmin}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
            >
              Promouvoir en administrateur
            </button>
          )}
        </div>
      </div>
    </div>
  );
}