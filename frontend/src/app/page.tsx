'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, MapPin, Search, ChevronRight, User as UserIcon, Building, Shield } from 'lucide-react';
import { MockDb, Society, Membership, User } from '@/lib/mockDb';

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user is logged in
    const activeUser = MockDb.getActiveUser();
    if (!activeUser) {
      router.push('/login');
      return;
    }
    setCurrentUser(activeUser);

    // Load memberships for this user
    const userMems = MockDb.memberships.filter(m => m.user_id === activeUser.id);
    setMemberships(userMems);

    // Get the details of the societies
    const allSoc = MockDb.societies;
    const userSocIds = userMems.map(m => m.society_id);
    const userSoc = allSoc.filter(s => userSocIds.includes(s.id));
    setSocieties(userSoc);
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('db_logged_in_user_id');
      router.push('/login');
    }
  };

  if (!mounted || !currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-zinc-500">Loading your societies...</span>
        </div>
      </div>
    );
  }

  // Filter societies based on search query
  const filteredSocieties = societies.filter(soc => 
    soc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    soc.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 w-full min-h-screen relative">
      {/* Top Header Section */}
      <header className="sticky top-0 bg-white border-b border-zinc-100 px-5 py-4 z-10 flex justify-center w-full">
        <div className="w-full max-w-5xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            {currentUser.avatar_url ? (
              <img 
                src={currentUser.avatar_url} 
                alt={currentUser.name} 
                className="w-11 h-11 rounded-full object-cover border-2 border-indigo-50"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="text-xs text-zinc-400 font-semibold tracking-wide uppercase">Welcome back</div>
              <h1 className="text-base font-bold text-zinc-800 flex items-center gap-1">
                {currentUser.name}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* User profile switcher for local validation flow */}
            <select
              value={currentUser.id}
              onChange={(e) => {
                MockDb.setActiveUser(e.target.value);
                window.location.reload();
              }}
              className="text-[10px] font-bold border border-zinc-200 rounded-lg p-1.5 bg-zinc-50 text-zinc-700 focus:outline-none"
              title="Switch Active Profile"
            >
              {MockDb.users.map(u => {
                const mem = MockDb.memberships.find(m => m.user_id === u.id && m.society_id === 'soc-orchid-heights');
                return (
                  <option key={u.id} value={u.id}>
                    {u.name} ({mem?.role || 'Guest'})
                  </option>
                );
              })}
            </select>

            <button 
              onClick={handleLogout}
              className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full btn-transition"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main layout contents centered */}
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col">
        {/* Hero Welcome banner */}
        <section className="px-5 pt-5 pb-2">
          <div className="bg-linear-to-r from-indigo-600 to-violet-600 p-5 rounded-2xl text-white shadow-xs">
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              My Societies
            </h2>
            <p className="text-xs text-indigo-100 mt-1">
              Tap a society to manage issues, broadcasts, alerts and monitor live presence.
            </p>
          </div>
        </section>

        {/* Search Bar */}
        <section className="px-5 py-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search societies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium text-zinc-700 shadow-xs"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
          </div>
        </section>

        {/* Society List (WhatsApp chat list style) */}
        <main className="flex-1 px-5 pb-8 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredSocieties.length > 0 ? (
              filteredSocieties.map((soc) => {
                const membership = memberships.find(m => m.society_id === soc.id);
                if (!membership) return null;

                // Get roles badges color styling
                let roleColor = 'bg-zinc-100 text-zinc-700';
                if (membership.role === 'secretary') roleColor = 'bg-rose-50 text-rose-700 border-rose-100';
                else if (membership.role === 'treasurer') roleColor = 'bg-amber-50 text-amber-700 border-amber-100';
                else if (membership.role === 'resident') roleColor = 'bg-indigo-50 text-indigo-700 border-indigo-100';

                return (
                  <div
                    key={soc.id}
                    onClick={() => router.push(`/society/${soc.id}/issues`)}
                    className="bg-white border border-zinc-100 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:border-indigo-200 hover:shadow-xs btn-transition group"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white btn-transition shadow-xs">
                        <Building className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-800 group-hover:text-indigo-600 btn-transition">
                          {soc.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold mt-0.5">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{soc.city}</span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-zinc-50 border-zinc-100 text-zinc-500">
                            {membership.flat_number}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${roleColor}`}>
                            {membership.role === 'asst_secretary' ? 'Asst. Secretary' : membership.role}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 btn-transition" />
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-zinc-200 p-6 col-span-2">
                <Building className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                <p className="text-zinc-500 font-medium text-sm">No societies found</p>
                <p className="text-zinc-400 text-xs mt-1">
                  {searchQuery ? "Try refining your search text." : "You don't have membership in any societies yet."}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer Branding */}
      <footer className="py-6 text-center text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
        AwasSahaay v1.0 • Accountability First
      </footer>
    </div>
  );
}
