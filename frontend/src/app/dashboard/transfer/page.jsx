"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import TransferForm from '@/components/TransferForm';

export default function TransferPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);
  
  if (loading || !isAuthenticated) {
    return <div className="text-center p-12 text-gray-300">Chargement...</div>;
  }
  
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-100">Virement bancaire</h1>
      <TransferForm />
    </div>
  );
}