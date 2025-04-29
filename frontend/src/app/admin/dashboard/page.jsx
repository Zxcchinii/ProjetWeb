"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import adminService from '@/services/adminService';

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Redirect if not admin
    if (!loading && (!isAuthenticated || (user && user.role !== 'admin'))) {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, user, router]);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getDashboard();
        setStats(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        setError('Erreur lors de la récupération des statistiques');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated && user?.role === 'admin') {
      fetchStats();
    }
  }, [isAuthenticated, user]);
  
  if (loading || isLoading) {
    return <div className="text-center p-12">Chargement...</div>;
  }
  
  if (error) {
    return <div className="text-red-500 text-center p-12">{error}</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord administrateur</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Nombre d'utilisateurs</h2>
          <p className="text-3xl font-bold text-blue-400">{stats?.userCount || 0}</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Nombre de comptes</h2>
          <p className="text-3xl font-bold text-green-400">{stats?.accountCount || 0}</p>
        </div>
      </div>
    </div>
  );
}