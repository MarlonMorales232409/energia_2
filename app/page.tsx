'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/state/auth';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect to appropriate dashboard based on user role
      const redirectPath = user.role === 'backoffice' 
        ? '/dashboard' 
        : '/inicio';
      router.replace(redirectPath);
    } else {
      // Redirect to login if not authenticated
      router.replace('/login');
    }
  }, [isAuthenticated, user, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-600" />
        <p className="text-slate-600">Redirigiendo...</p>
      </div>
    </div>
  );
}
