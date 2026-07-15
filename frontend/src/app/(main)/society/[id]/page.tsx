'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  MessageSquare, AlertTriangle, Megaphone, Users, 
  Trophy, ShieldAlert, Award, Settings, PlusCircle,
  Building, CheckCircle2, ShieldAlert as LockIcon,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { MockDb, User, Membership } from '@/lib/mockDb';

export default function SocietyDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const societyId = params?.id as string;

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [activeAlertsList, setActiveAlertsList] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const loadData = () => {
    const activeUser = MockDb.getActiveUser();
    if (!activeUser) {
      router.push('/login');
      return;
    }
    setCurrentUser(activeUser);

    const mem = MockDb.getUserMembership(activeUser.id, societyId);
    if (mem) {
      setMembership(mem);
    }

    const list = MockDb.alerts.filter(a => a.society_id === societyId && a.status === 'active');
    setActiveAlertsList(list);
    setActiveIndex(0);
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [societyId, router]);

  const handlePrevAlert = () => {
    if (activeAlertsList.length <= 1) return;
    setActiveIndex((prev) => (prev === 0 ? activeAlertsList.length - 1 : prev - 1));
  };

  const handleNextAlert = () => {
    if (activeAlertsList.length <= 1) return;
    setActiveIndex((prev) => (prev === activeAlertsList.length - 1 ? 0 : prev + 1));
  };

  // Autoplay alerts carousel (slides every 4.5 seconds)
  useEffect(() => {
    if (activeAlertsList.length <= 1) return;
    const interval = setInterval(() => {
      handleNextAlert();
    }, 4500);
    return () => clearInterval(interval);
  }, [activeAlertsList.length]);

  const handleResolveAlert = (alertId: string) => {
    MockDb.resolveAlert(alertId, societyId);
    loadData();
  };

  const getAlertElapsedTimeText = (timeStr: string) => {
    const created = new Date(timeStr).getTime();
    const now = Date.now();
    const diffMs = Math.max(0, now - created);
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${Math.floor(diffHrs / 24)}d ago`;
  };

  if (!mounted || !currentUser) return null;

  const isCommittee = membership && ['secretary', 'asst_secretary', 'treasurer'].includes(membership.role);

  // Stats calculate
  const activeIssues = MockDb.issues.filter(i => i.society_id === societyId && i.status !== 'verified').length;
  const activeAlerts = activeAlertsList.length;
  const announcementsCount = MockDb.announcements.filter(a => a.society_id === societyId).length;

  const menuItems = [
    {
      id: 'chat',
      title: 'General Chat',
      icon: <MessageSquare className="w-4.5 h-4.5 text-indigo-400" />,
      badge: 'Live Chat',
      path: `/society/${societyId}/general`
    },
    {
      id: 'alerts',
      title: 'Security Alerts',
      icon: <AlertTriangle className="w-4.5 h-4.5 text-rose-455 animate-pulse" />,
      badge: activeAlerts > 0 ? `${activeAlerts} active` : null,
      path: `/society/${societyId}/alerts`
    },
    {
      id: 'announcements',
      title: 'Notices',
      icon: <Megaphone className="w-4.5 h-4.5 text-amber-450" />,
      badge: announcementsCount > 0 ? `${announcementsCount} new` : null,
      path: `/society/${societyId}/announcements`
    },
    {
      id: 'directory',
      title: 'Directory',
      icon: <Users className="w-4.5 h-4.5 text-sky-400" />,
      path: `/society/${societyId}/directory`
    },
    {
      id: 'leaderboard',
      title: 'Standings',
      icon: <Trophy className="w-4.5 h-4.5 text-yellow-400" />,
      badge: 'Score',
      path: `/society/${societyId}/leaderboard`
    },
    {
      id: 'workers',
      title: 'Helpers',
      icon: <Award className="w-4.5 h-4.5 text-emerald-400" />,
      path: `/society/${societyId}/workers`
    },
    {
      id: 'feedback',
      title: 'Feedbacks',
      icon: <CheckCircle2 className="w-4.5 h-4.5 text-teal-400" />,
      path: `/society/${societyId}/feedback`
    },
    {
      id: 'admin',
      title: 'Console',
      icon: isCommittee ? <Settings className="w-4.5 h-4.5 text-purple-400" /> : <LockIcon className="w-4.5 h-4.5 text-zinc-500" />,
      badge: isCommittee ? 'Admin' : 'Locked',
      path: isCommittee ? `/society/${societyId}/admin` : null
    },
    {
      id: 'new_issue',
      title: 'File Issue',
      icon: <PlusCircle className="w-4.5 h-4.5 text-indigo-450" />,
      badge: 'Raise +',
      path: `/society/${societyId}/issues/new`
    }
  ];

  const handleCardClick = (item: typeof menuItems[0]) => {
    if (!item.path) {
      alert("Access Denied: Only committee admins (Secretaries/Treasurers) can access the Admin Console.");
      return;
    }
    router.push(item.path);
  };

  return (
    <div className="p-5 space-y-6 pb-28 animate-fade-in min-h-full bg-transparent relative z-10 select-none">

      {/* 2. Interactive Active Security Alerts Carousel */}
      <section className="space-y-3.5 z-10 relative">
        <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-widest pl-1 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
          <span>Active Security Broadcasts ({activeAlertsList.length})</span>
        </h3>
        
        {activeAlertsList.length > 0 ? (
          (() => {
            const N = activeAlertsList.length;
            const safeIndex = activeIndex % N;
            const currentAlert = activeAlertsList[safeIndex];
            if (!currentAlert) return null;

            const poster = MockDb.users.find(u => u.id === currentAlert.posted_by);
            const membershipInfo = MockDb.getUserMembership(currentAlert.posted_by, societyId);
            const timeDiffStr = getAlertElapsedTimeText(currentAlert.created_at);

            return (
              <div className="relative w-full max-w-2xl mx-auto py-2 px-10 group select-none flex flex-col items-center">
                
                {/* Left navigation Arrow */}
                {N > 1 && (
                  <button
                    onClick={handlePrevAlert}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-55 flex items-center justify-center shadow-md cursor-pointer"
                    title="Previous alert"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                {/* Right navigation Arrow */}
                {N > 1 && (
                  <button
                    onClick={handleNextAlert}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-55 flex items-center justify-center shadow-md cursor-pointer"
                    title="Next alert"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}

                {/* Active Card Body */}
                <div
                  className={`w-full h-[155px] bg-white border rounded-3xl p-4.5 shadow-xs flex flex-col justify-between backdrop-blur-md transition-all ${
                    currentAlert.severity === 'critical' 
                      ? 'border-rose-200/80 shadow-[0_4px_16px_rgba(244,63,94,0.03)]' 
                      : 'border-amber-200/80 shadow-[0_4px_16px_rgba(245,158,11,0.02)]'
                  }`}
                >
                  {/* Header: Severity & Resolve Button */}
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        currentAlert.severity === 'critical' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
                      }`} />
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        currentAlert.severity === 'critical' 
                          ? 'bg-rose-50 text-rose-600 border-rose-100' 
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {currentAlert.severity} alert
                      </span>
                    </div>

                    <button
                      onClick={() => handleResolveAlert(currentAlert.id)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 rounded-xl text-[8.5px] sm:text-[9.5px] md:text-[11px] font-black uppercase tracking-wider transition cursor-pointer whitespace-nowrap"
                    >
                      Resolve
                    </button>
                  </div>

                  {/* Message Box */}
                  <div className="text-left h-[48px] overflow-y-auto pr-1 select-text scrollbar-thin scrollbar-thumb-zinc-200">
                    <p className="text-xs sm:text-sm font-semibold text-zinc-800 leading-normal">
                      {currentAlert.message}
                    </p>
                  </div>

                  {/* Footer Info */}
                  <div className="border-t border-zinc-100 pt-2 flex items-center gap-2 text-left">
                    {poster?.avatar_url ? (
                      <img src={poster.avatar_url} alt={poster.name} className="w-6.5 h-6.5 rounded-full object-cover border border-zinc-100" />
                    ) : (
                      <div className="w-6.5 h-6.5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-[9px] border border-indigo-100">
                        {poster?.name.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-[9px] sm:text-[10px] font-black text-zinc-700 truncate max-w-[200px]">
                        {poster?.name || 'Resident'}
                      </div>
                      <div className="text-[8px] font-semibold text-zinc-400">
                        Flat {membershipInfo?.flat_number || 'B-302'} • {timeDiffStr}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom slides indicator dots */}
                {N > 1 && (
                  <div className="flex justify-center gap-1.5 mt-3">
                    {activeAlertsList.map((_, i) => (
                      <button 
                        key={i} 
                        onClick={() => setActiveIndex(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          i === safeIndex ? 'bg-indigo-500 w-3' : 'bg-zinc-200 hover:bg-zinc-300'
                        }`} 
                      />
                    ))}
                  </div>
                )}

              </div>
            );
          })()
        ) : (
          <div className="bg-white/70 border border-zinc-200/50 rounded-3xl p-5 text-center flex flex-col items-center justify-center gap-2 backdrop-blur-md select-none shadow-3xs">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-3 py-0.5 rounded-full animate-pulse">
              All Safe
            </span>
            <p className="text-xs font-semibold text-zinc-600">🎉 Orchid Heights record is clean! No active security alerts.</p>
          </div>
        )}
      </section>

      {/* Grid of 9 Cards (Always 3x3 layout to prevent vertical scrolling) */}
      <section className="space-y-3 z-10 relative">
        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">
          Feature Hub
        </h3>
        
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          {menuItems.map((item) => {
            const isLocked = item.id === 'admin' && !isCommittee;
            return (
              <div
                key={item.id}
                onClick={() => handleCardClick(item)}
                className={`group flex flex-col items-center justify-center p-2 rounded-2xl cursor-pointer select-none transition-all duration-300 relative shadow-3xs border text-center h-[76px] xs:h-[84px] sm:h-[105px] pointer-events-auto ${
                  isLocked 
                    ? 'bg-zinc-100/50 border-zinc-200 opacity-55 cursor-not-allowed'
                    : 'bg-white/75 border-zinc-200/60 hover:border-indigo-300 hover:bg-white/95 hover:shadow-xs'
                }`}
              >
                {/* Icon centered */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-1 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  {item.icon}
                </div>
                
                {/* Centered label below icon with responsive font sizes */}
                <div className="w-full text-center px-1 truncate min-w-0">
                  <span className="text-[7.5px] xs:text-[9.0px] sm:text-[10.5px] font-black text-zinc-600 group-hover:text-indigo-600 uppercase tracking-wider block truncate transition-colors duration-300">
                    {item.title}
                  </span>
                </div>

                {/* Absolute Badge corner indicator (small and out of way) */}
                {item.badge && (
                  <span className={`absolute top-1 right-1 text-[6px] sm:text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                    item.badge === 'Live Chat' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                    item.badge === 'Locked' ? 'bg-zinc-100 text-zinc-450 border border-zinc-200' :
                    item.badge === 'Admin' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                    'bg-rose-50 text-rose-600 border border-rose-100'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
