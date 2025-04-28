// app/dashboard/layout.jsx
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex bg-gray-900">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
