"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import adminService from '@/services/adminService';

export default function AdminUsersPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  useEffect(() => {
    if (!loading && (!isAuthenticated || (user && user.role !== 'admin'))) {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, user, router]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await adminService.getUsers();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated && user?.role === 'admin') {
      fetchUsers();
    }
  }, [isAuthenticated, user]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await adminService.deleteUser(userId);
        setUsers(users.filter(u => u.id !== userId));
        setMessage({ text: 'Utilisateur supprimé avec succès', type: 'success' });
      } catch (error) {
        console.error('Error deleting user:', error);
        setMessage({ text: 'Erreur lors de la suppression de l\'utilisateur', type: 'error' });
      }
    }
  };

  const handlePromoteToAdmin = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir promouvoir cet utilisateur en tant qu\'administrateur ?')) {
      try {
        await adminService.promoteToAdmin(userId);
        setUsers(users.map(u => u.id === userId ? { ...u, role: 'admin' } : u));
        setMessage({ text: 'Utilisateur promu administrateur avec succès', type: 'success' });
      } catch (error) {
        console.error('Error promoting user:', error);
        setMessage({ text: 'Erreur lors de la promotion de l\'utilisateur', type: 'error' });
      }
    }
  };
  
  if (loading || isLoading || !user || user.role !== 'admin') {
    return <div className="text-center p-12">Chargement...</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestion des utilisateurs</h1>
      
      {message.text && (
        <div className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}>
          {message.text}
        </div>
      )}
      
      <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-750">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nom</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rôle</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.first_name} {user.last_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                  <Link 
                    href={`/admin/users/${user.id}`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Détails
                  </Link>
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-400 hover:text-red-300 ml-3"
                  >
                    Supprimer
                  </button>
                  {user.role !== 'admin' && (
                    <button 
                      onClick={() => handlePromoteToAdmin(user.id)}
                      className="text-green-400 hover:text-green-300 ml-3"
                    >
                      Promouvoir
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}