'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { Menu, Home, Bell, X, ShieldCheck, Building, MessageSquare, Trophy, User as UserIcon } from 'lucide-react';
import { MockDb, Society, User, Membership } from '@/lib/mockDb';
import ChannelSidebar from '@/components/ChannelSidebar';
import ParticleBackground from '@/components/ParticleBackground';

export default function SocietyLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const id = params?.id as string;

  const [society, setSociety] = useState<Society | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [myMembership, setMyMembership] = useState<Membership | null>(null);
  const [nudgeList, setNudgeList] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [presence, setPresence] = useState<'online' | 'away' | 'offline'>('online');
  const [mounted, setMounted] = useState(false);

  const loadData = () => {
    const activeUser = MockDb.getActiveUser();
    if (!activeUser) {
      router.push('/login');
      return;
    }
    setCurrentUser(activeUser);

    const soc = MockDb.societies.find(s => s.id === id);
    if (!soc) {
      router.push('/');
      return;
    }
    setSociety(soc);

    const mem = MockDb.getUserMembership(activeUser.id, id);
    if (mem) {
      setMyMembership(mem);
      const activeNudges = MockDb.nudges.filter(
        n => n.society_id === id && 
        n.target_flat.toLowerCase() === mem.flat_number.toLowerCase() && 
        n.status === 'active'
      );
      setNudgeList(activeNudges);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [id, router]);

  // Listener to poll local storage updates (e.g. when switched user or nudged from member directory)
  useEffect(() => {
    const interval = setInterval(() => {
      if (mounted) {
        loadData();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [mounted, id]);

  const handleResolveNudge = (nudgeId: string) => {
    MockDb.resolveNudge(nudgeId, id);
    loadData();
  };

  if (!mounted || !society || !currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-zinc-500">Entering Society Space...</span>
        </div>
      </div>
    );
  }

  const getChannelName = () => {
    if (pathname.includes('/admin')) return '⚙ Admin Console';
    if (pathname.includes('/general')) return '💬 General Chat';
    if (pathname.includes('/issues')) return '⚠ Issue Tracking';
    if (pathname.includes('/announcements')) return '📢 Announcements';
    if (pathname.includes('/alerts')) return '📌 Community Alerts';
    if (pathname.includes('/feedback')) return '💬 Member Feedback';
    if (pathname.includes('/leaderboard')) return '🏆 Block Standings';
    if (pathname.includes('/directory')) return '👥 Members Directory';
    if (pathname.includes('/workers')) return '🛠️ Maintenance Heroes';
    return 'Dashboard';
  };

  const mySocieties = currentUser 
    ? MockDb.societies.filter(s => 
        MockDb.memberships.some(m => m.user_id === currentUser.id && m.society_id === s.id)
      )
    : [];

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('db_logged_in_user_id');
      router.push('/login');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-transparent relative w-full select-none">
      {/* Universal Particle Background */}
      <ParticleBackground />

      {/* 1. Top Navbar (Banking / Jio App Style) */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-zinc-100 h-14 flex items-center justify-between px-4 z-35 flex-shrink-0 shadow-2xs">
        
        {/* Left side: Static profile welcome message */}
        <div className="flex items-center gap-2.5">
          {currentUser.avatar_url ? (
            <img 
              src={currentUser.avatar_url} 
              alt={currentUser.name} 
              className="w-8.5 h-8.5 rounded-full object-cover border border-zinc-205 shadow-3xs" 
            />
          ) : (
            <div className="w-8.5 h-8.5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shadow-3xs">
              {currentUser.name.charAt(0)}
            </div>
          )}
          
          <div className="leading-none text-left">
            <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Hello, Resident</div>
            <div className="text-xs font-bold text-zinc-800 mt-0.5 max-w-[125px] truncate">{currentUser.name}</div>
          </div>
        </div>

        {/* Center: Society Label */}
        <div className="hidden sm:block text-center flex-1">
          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
            {society.name}
          </span>
        </div>

        {/* Right side: Nav actions + Profile Trigger settings dropdown */}
        <div className="flex items-center gap-1">
          {/* Home screen redirect */}
          <button 
            onClick={() => router.push('/')}
            className="p-2 text-zinc-500 hover:text-indigo-600 hover:bg-zinc-55 rounded-xl btn-transition cursor-pointer"
            title="My Societies Screen"
          >
            <Home className="w-5 h-5" />
          </button>

          {/* Notification bell for nudges */}
          <button 
            onClick={() => setShowNotifications(true)}
            className="p-2 text-zinc-500 hover:text-indigo-600 hover:bg-zinc-55 rounded-xl btn-transition relative cursor-pointer"
            title="Community Nudge Inbox"
          >
            <Bell className="w-5 h-5" />
            {nudgeList.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse border border-white" />
            )}
          </button>

          {/* Dedicated Profile Settings Button (lucide-react UserIcon) */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileModal(!showProfileModal)}
              className={`p-2 rounded-xl btn-transition flex items-center justify-center cursor-pointer ${
                showProfileModal ? 'bg-indigo-50 text-indigo-650' : 'text-zinc-500 hover:text-indigo-600 hover:bg-zinc-55'
              }`}
              title="Profile Settings"
            >
              <UserIcon className="w-5 h-5" />
            </button>

            {/* Profile settings & swapper absolute popup panel */}
            {showProfileModal && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileModal(false)} />
                <div className="absolute right-0 mt-2.5 w-60 bg-white border border-zinc-150 rounded-2xl p-4 shadow-xl z-50 animate-scale-up space-y-3.5">
                  
                  {/* Profile Header */}
                  <div className="flex items-center gap-2.5 pb-2.5 border-b border-zinc-100">
                    {currentUser.avatar_url ? (
                      <img src={currentUser.avatar_url} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover border" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                        {currentUser.name.charAt(0)}
                      </div>
                    )}
                    <div className="text-left">
                      <h4 className="text-xs font-black text-zinc-900 leading-tight">{currentUser.name}</h4>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-zinc-50 capitalize text-zinc-500 mt-1 inline-block">
                        {myMembership?.role || 'Resident'}
                      </span>
                    </div>
                  </div>

                  {/* Presence Status Toggle */}
                  <div className="space-y-1 text-left">
                    <label className="block text-[8px] font-black uppercase text-zinc-400 tracking-wider">Presence Status</label>
                    <div className="flex items-center gap-2 bg-zinc-50 p-1.5 rounded-lg border border-zinc-100">
                      <div className={`w-2 h-2 rounded-full ${
                        presence === 'online' ? 'bg-emerald-500 animate-pulse' :
                        presence === 'away' ? 'bg-amber-500' : 'bg-zinc-400'
                      }`} />
                      <span className="text-[10px] font-bold text-zinc-700 capitalize flex-1">
                        {presence}
                      </span>
                      <select
                        value={presence}
                        onChange={(e) => setPresence(e.target.value as any)}
                        className="bg-transparent text-[10px] font-bold text-zinc-500 focus:outline-none cursor-pointer"
                      >
                        <option value="online">Online</option>
                        <option value="away">Away</option>
                        <option value="offline">Offline</option>
                      </select>
                    </div>
                  </div>

                  {/* Switch Perspective Select dropdown */}
                  <div className="space-y-1 text-left">
                    <label className="block text-[8px] font-black uppercase text-zinc-400 tracking-wider">Switch Perspective</label>
                    <select
                      value={currentUser.id}
                      onChange={(e) => {
                        MockDb.setActiveUser(e.target.value);
                        window.location.reload();
                      }}
                      className="w-full text-xs font-bold border border-zinc-200 rounded-lg p-2 bg-zinc-50 text-zinc-700 focus:outline-none cursor-pointer"
                    >
                      {MockDb.users.map(u => {
                        const mem = MockDb.getUserMembership(u.id, id);
                        if (!mem) return null;
                        return (
                          <option key={u.id} value={u.id}>
                            {u.name} ({mem.role === 'secretary' ? 'Secretary' : mem.role === 'worker' ? 'Hero' : 'Resident'})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Switch Society Select dropdown (Only visible if user has > 1 society) */}
                  {mySocieties.length > 1 && (
                    <div className="space-y-1 text-left">
                      <label className="block text-[8px] font-black uppercase text-zinc-400 tracking-wider">Switch Society / Apartment</label>
                      <select
                        value={id}
                        onChange={(e) => {
                          setShowProfileModal(false);
                          router.push(`/society/${e.target.value}`);
                        }}
                        className="w-full text-xs font-bold border border-zinc-200 rounded-lg p-2 bg-zinc-50 text-zinc-700 focus:outline-none cursor-pointer"
                      >
                        {mySocieties.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (confirm("Reset local database to default seed values? This will reset all stats.")) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="w-full text-center text-[9px] font-black uppercase tracking-wider text-rose-500 bg-rose-50 hover:bg-rose-100/50 py-2 rounded-xl border border-rose-100 transition cursor-pointer"
                  >
                    Reset Database State
                  </button>

                  <button
                    onClick={() => {
                      localStorage.removeItem('db_logged_in_user_id');
                      window.location.reload();
                    }}
                    className="w-full text-center text-[9px] font-black uppercase tracking-wider text-zinc-500 bg-zinc-50 hover:bg-zinc-150 py-2 rounded-xl border border-zinc-100 transition cursor-pointer"
                  >
                    Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 3. Main Outlet Container */}
      <main className="flex-1 w-full min-w-0 overflow-y-auto relative bg-transparent pb-20">
        {children}
      </main>

      {/* 4. Bottom Tab Bar Navigation */}
      <nav className="fixed bottom-0 inset-x-0 h-16 bg-white border-t border-zinc-100 z-30 flex items-center justify-around px-4 shadow-[0_-3px_15px_rgba(0,0,0,0.03)] pb-safe">
        {[
          { 
            label: 'Home', 
            icon: <Building className="w-5 h-5" />, 
            path: `/society/${id}`,
            active: pathname === `/society/${id}`
          },
          { 
            label: 'Chat', 
            icon: <MessageSquare className="w-5 h-5" />, 
            path: `/society/${id}/general`,
            active: pathname.includes('/general')
          },
          { 
            label: 'Complaints', 
            icon: <ShieldCheck className="w-5 h-5" />, 
            path: `/society/${id}/issues`,
            active: pathname.includes('/issues')
          },
          { 
            label: 'Standings', 
            icon: <Trophy className="w-5 h-5" />, 
            path: `/society/${id}/leaderboard`,
            active: pathname.includes('/leaderboard')
          }
        ].map((tab, idx) => (
          <button
            key={idx}
            onClick={() => router.push(tab.path)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all gap-1 cursor-pointer ${
              tab.active 
                ? 'text-indigo-600 font-extrabold scale-105' 
                : 'text-zinc-400 font-bold hover:text-zinc-600'
            }`}
          >
            {tab.icon}
            <span className="text-[9px] uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* 5. Notification Inbox Drawer */}
      {showNotifications && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-xs p-5 shadow-xl border border-zinc-100 flex flex-col relative animate-scale-up space-y-4">
            <button
              onClick={() => setShowNotifications(false)}
              className="absolute top-3.5 right-3.5 p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-sm font-black text-zinc-800">🔔 Community Inbox</h3>
              <p className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-wider">
                {myMembership ? `Flat ${myMembership.flat_number}` : 'Guest User'}
              </p>
            </div>

            {/* Vibe Score Gauge */}
            {myMembership && (
              <div className="bg-linear-to-r from-rose-50 to-zinc-50 p-3 rounded-2xl border border-rose-100/30 flex justify-between items-center">
                <div>
                  <h4 className="text-[10px] font-black text-zinc-800 uppercase tracking-wide">Flat Vibe Score</h4>
                  <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">Keep above 80% to lock awards</p>
                </div>
                <span className="text-base font-black text-rose-600">
                  {myMembership.vibe_score ?? 100}%
                </span>
              </div>
            )}

            {/* Nudges List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {nudgeList.length > 0 ? (
                nudgeList.map((nudge) => (
                  <div key={nudge.id} className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 space-y-2 text-left">
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-full">
                        Anonymous Nudge
                      </span>
                      <span className="text-[8px] text-zinc-400 font-bold uppercase">
                        {new Date(nudge.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>

                    <p className="text-[11px] font-semibold text-zinc-700 italic leading-relaxed leading-normal break-words">
                      "{nudge.message}"
                    </p>

                    <button
                      onClick={() => handleResolveNudge(nudge.id)}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 transition"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>Resolve & Apologize (+3% Vibe)</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-zinc-400 text-xs font-semibold">
                  🎉 Community record is clean! No neighbor friction alerts.
                </div>
              )}
            </div>

            <button
              onClick={() => setShowNotifications(false)}
              className="w-full py-2 bg-zinc-900 hover:bg-zinc-950 text-white text-[10px] font-extrabold uppercase rounded-xl transition"
            >
              Close Inbox
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
