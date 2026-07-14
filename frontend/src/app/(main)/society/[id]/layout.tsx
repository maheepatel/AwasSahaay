'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { Menu, Home, Bell, X, ShieldCheck } from 'lucide-react';
import { MockDb, Society, User, Membership } from '@/lib/mockDb';
import ChannelSidebar from '@/components/ChannelSidebar';
import PinnedAlertsStrip from '@/components/PinnedAlertsStrip';

export default function SocietyLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const id = params?.id as string;

  const [society, setSociety] = useState<Society | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [myMembership, setMyMembership] = useState<Membership | null>(null);
  const [nudgeList, setNudgeList] = useState<any[]>([]);
  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
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

  const closeDrawers = () => {
    setShowLeftSidebar(false);
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
    if (pathname.includes('/admin')) return '⚙ Admin Panel';
    if (pathname.includes('/general')) return '💬 General Chat';
    if (pathname.includes('/issues')) return '⚠ Issue Tracking';
    if (pathname.includes('/announcements')) return '📢 Announcements';
    if (pathname.includes('/alerts')) return '📌 Community Alerts';
    if (pathname.includes('/feedback')) return '💬 Member Feedback';
    if (pathname.includes('/leaderboard')) return '🏆 Block Standings';
    if (pathname.includes('/directory')) return '👥 Members Directory';
    if (pathname.includes('/workers')) return '🛠️ Maintenance Heroes';
    return 'General';
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-screen overflow-hidden bg-zinc-50 relative w-full">
      {/* 1. Left Sidebar (Absolute drawer on mobile, relative permanent column on tablet/desktop) */}
      <div className={`
        absolute md:relative inset-y-0 left-0 z-40 transform md:transform-none transition-transform duration-300 ease-in-out flex-shrink-0 h-full
        ${showLeftSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <ChannelSidebar 
          society={society} 
          currentUser={currentUser} 
          onClose={() => setShowLeftSidebar(false)} 
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 bg-white border-b border-zinc-100 h-14 flex items-center justify-between px-4 z-20 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => {
                setShowLeftSidebar(!showLeftSidebar);
              }}
              className="p-2 text-zinc-600 hover:text-indigo-600 hover:bg-zinc-100 rounded-lg btn-transition md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider">
                {society.name}
              </span>
              <h2 className="text-sm font-black text-zinc-800">
                {getChannelName()}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Home button */}
            <button 
              onClick={() => router.push('/')}
              className="p-2 text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100 rounded-lg btn-transition"
              title="Home Screen"
            >
              <Home className="w-4.5 h-4.5" />
            </button>

            {/* Notification Bell */}
            <button 
              onClick={() => setShowNotifications(true)}
              className="p-2 text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100 rounded-lg btn-transition relative"
              title="Inbox Alerts"
            >
              <Bell className="w-4.5 h-4.5" />
              {nudgeList.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
          </div>
        </header>

        {/* 2. Pinned Alerts Strip */}
        <PinnedAlertsStrip 
          societyId={society.id} 
          currentUser={currentUser} 
          onAlertResolved={() => {
            router.refresh();
          }}
        />

        {/* Channel Router Outlet children */}
        <main className="flex-1 w-full min-w-0 overflow-y-auto relative bg-zinc-50">
          {children}
        </main>
      </div>

      {/* 3. Notification Inbox Sheet Drawer Overlay */}
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

      {/* Backdrop overlay */}
      {showLeftSidebar && (
        <div 
          onClick={closeDrawers}
          className="absolute inset-0 bg-black/30 z-30 transition-opacity duration-300"
        />
      )}
    </div>
  );
}
