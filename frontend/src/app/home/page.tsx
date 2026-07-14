'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Search, ChevronRight, Building, ShieldCheck, Sparkles, Star, Users, CheckCircle2 } from 'lucide-react';
import { MockDb, Society, User } from '@/lib/mockDb';
import AmbientBackground from '@/components/AmbientBackground';

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const activeUser = MockDb.getActiveUser();
    if (activeUser) {
      setCurrentUser(activeUser);
    }
    setSocieties(MockDb.societies);
  }, []);

  if (!mounted) return null;

  const handleLogout = () => {
    localStorage.removeItem('db_logged_in_user_id');
    window.location.reload();
  };

  const handleSocietyClick = (id: string) => {
    if (!currentUser) {
      router.push(`/login?redirect=/society/${id}`);
    } else {
      router.push(`/society/${id}`);
    }
  };

  const filteredSocieties = societies.filter(soc =>
    soc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    soc.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen relative overflow-x-hidden text-zinc-100 select-none pb-24">
      {/* Morphing Aurora Mesh Background */}
      <AmbientBackground />

      {/* 1. Header Navbar */}
      <header className="sticky top-0 bg-zinc-950/40 backdrop-blur-md border-b border-zinc-800/40 px-6 py-4 z-30 flex justify-center w-full">
        <div className="w-full max-w-5xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-900/50">
              <ShieldCheck className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <span className="text-[7px] font-black tracking-widest text-indigo-400 uppercase leading-none block">Platform Directory</span>
              <span className="text-sm font-extrabold text-zinc-100 leading-none">AwasSahaay</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800/60 pl-3 pr-1.5 py-1.5 rounded-2xl">
                <span className="text-xs font-bold text-zinc-300">{currentUser.name}</span>
                <button 
                  onClick={handleLogout}
                  className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md shadow-indigo-950 cursor-pointer transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="px-6 pt-16 pb-8 text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 bg-indigo-900/35 border border-indigo-850 px-3 py-1 rounded-full text-indigo-300 text-[9px] font-black uppercase tracking-widest animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gateway to Smart Housing</span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
          Manage Your Wing,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400">
            Collaborate Seamlessly
          </span>
        </h1>
        
        <p className="text-xs sm:text-sm text-zinc-400 font-medium max-w-lg mx-auto leading-relaxed">
          Verify complaints in real-time, get instant security broadcasts, track Wing Standings and rate resolving heroes in a secure digital space.
        </p>
      </section>

      {/* 3. Metric Stats Container */}
      <section className="max-w-4xl mx-auto w-full px-6 grid grid-cols-3 gap-3 mb-10 text-center">
        <div className="bg-zinc-900/40 border border-zinc-800/45 p-4 rounded-2xl backdrop-blur-xs">
          <div className="text-lg font-black text-indigo-400">12+</div>
          <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mt-1">Smart Societies</div>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/45 p-4 rounded-2xl backdrop-blur-xs">
          <div className="text-lg font-black text-violet-400">99.8%</div>
          <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mt-1">SLA Resolved</div>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/45 p-4 rounded-2xl backdrop-blur-xs">
          <div className="text-lg font-black text-sky-400">15K+</div>
          <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mt-1">Cooperating Residents</div>
        </div>
      </section>

      {/* 4. Directory Search & List */}
      <section className="max-w-xl mx-auto w-full px-6 space-y-5">
        <div className="relative">
          <input
            type="text"
            placeholder="Search society name, city or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-zinc-900/60 border border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-bold text-zinc-200 placeholder-zinc-500 shadow-lg backdrop-blur-md"
          />
          <Search className="absolute left-4 top-3.5 w-4.5 h-4.5 text-zinc-500" />
        </div>

        <div className="space-y-3">
          <h3 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">
            Available Portals ({filteredSocieties.length})
          </h3>

          {filteredSocieties.length > 0 ? (
            filteredSocieties.map((soc) => (
              <div
                key={soc.id}
                onClick={() => handleSocietyClick(soc.id)}
                className="group p-4 bg-zinc-900/50 hover:bg-zinc-900/90 border border-zinc-800 hover:border-indigo-500/50 rounded-2xl cursor-pointer transition-all flex items-center justify-between shadow-md"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 group-hover:bg-indigo-950/40 border border-zinc-700/60 group-hover:border-indigo-500/30 flex items-center justify-center transition-all flex-shrink-0">
                    <Building className="w-5 h-5 text-zinc-400 group-hover:text-indigo-400" />
                  </div>
                  <div className="min-w-0 text-left">
                    <h4 className="text-xs font-black text-zinc-100 group-hover:text-indigo-400 transition truncate leading-none">
                      {soc.name}
                    </h4>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide mt-1.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-zinc-650" />
                      <span>{soc.address}, {soc.city}</span>
                    </span>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-lg bg-zinc-850 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all text-zinc-500">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-zinc-900/30 border border-zinc-850 rounded-2xl">
              <p className="text-xs font-bold text-zinc-500">No society portals found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
