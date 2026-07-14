'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MockDb } from '@/lib/mockDb';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const activeUser = MockDb.getActiveUser();
    
    if (activeUser) {
      // Find user memberships
      const userMems = MockDb.memberships.filter(m => m.user_id === activeUser.id);
      if (userMems.length > 0) {
        // Land directly inside their active society dashboard
        router.replace(`/society/${userMems[0].society_id}`);
      } else {
        router.replace('/home');
      }
    } else {
      // Not logged in: go to login screen
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#090b0f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-zinc-550 uppercase tracking-widest">Routing Space...</span>
      </div>
    </div>
  );
}
