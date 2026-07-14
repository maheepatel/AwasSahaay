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
  const [isFading, setIsFading] = useState(false);
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
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [societyId, router]);

  // Autoplay alerts carousel (slides every 4.5 seconds)
  useEffect(() => {
    if (activeAlertsList.length <= 1) return;
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev === activeAlertsList.length - 1 ? 0 : prev + 1));
        setIsFading(false);
      }, 200);
    }, 4500);
    return () => clearInterval(interval);
  }, [activeAlertsList.length]);

  const handlePrevAlert = () => {
    setIsFading(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev === 0 ? activeAlertsList.length - 1 : prev - 1));
      setIsFading(false);
    }, 200);
  };

  const handleNextAlert = () => {
    setIsFading(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev === activeAlertsList.length - 1 ? 0 : prev + 1));
      setIsFading(false);
    }, 200);
  };

  const handleResolveAlert = (alertId: string) => {
    MockDb.resolveAlert(alertId, societyId);
    setActiveIndex((prev) => Math.max(0, Math.min(prev, activeAlertsList.length - 2)));
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
      desc: 'Discuss with neighbors',
      icon: <MessageSquare className="w-5 h-5 text-indigo-600" />,
      color: 'from-indigo-50/50 to-indigo-100/10 hover:border-indigo-300',
      badge: 'Live Chat',
      path: `/society/${societyId}/general`
    },
    {
      id: 'alerts',
      title: 'Security Alerts',
      desc: 'Critical broadcast notices',
      icon: <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse" />,
      color: 'from-rose-50/50 to-rose-100/10 hover:border-rose-300',
      badge: activeAlerts > 0 ? `${activeAlerts} active` : null,
      path: `/society/${societyId}/alerts`
    },
    {
      id: 'announcements',
      title: 'Announcements',
      desc: 'Official committee letters',
      icon: <Megaphone className="w-5 h-5 text-amber-600" />,
      color: 'from-amber-50/50 to-amber-100/10 hover:border-amber-300',
      badge: announcementsCount > 0 ? `${announcementsCount} new` : null,
      path: `/society/${societyId}/announcements`
    },
    {
      id: 'directory',
      title: 'Members Directory',
      desc: 'Apartment owner listing',
      icon: <Users className="w-5 h-5 text-sky-600" />,
      color: 'from-sky-50/50 to-sky-100/10 hover:border-sky-300',
      path: `/society/${societyId}/directory`
    },
    {
      id: 'leaderboard',
      title: 'Wing Standing',
      desc: 'Block Wars competition',
      icon: <Trophy className="w-5 h-5 text-yellow-600" />,
      color: 'from-yellow-50/50 to-yellow-100/10 hover:border-yellow-300',
      badge: 'Leaderboard',
      path: `/society/${societyId}/leaderboard`
    },
    {
      id: 'workers',
      title: 'Service Heroes',
      desc: 'Plumbers, electricians...',
      icon: <Award className="w-5 h-5 text-emerald-600" />,
      color: 'from-emerald-50/50 to-emerald-100/10 hover:border-emerald-300',
      path: `/society/${societyId}/workers`
    },
    {
      id: 'feedback',
      title: 'SLA Feedback',
      desc: 'Review resolution logs',
      icon: <CheckCircle2 className="w-5 h-5 text-teal-600" />,
      color: 'from-teal-50/50 to-teal-100/10 hover:border-teal-300',
      path: `/society/${societyId}/feedback`
    },
    {
      id: 'admin',
      title: 'Admin Console',
      desc: 'Manage membership registrations',
      icon: isCommittee ? <Settings className="w-5 h-5 text-purple-600" /> : <LockIcon className="w-5 h-5 text-zinc-400" />,
      color: isCommittee 
        ? 'from-purple-50/50 to-purple-100/10 hover:border-purple-300' 
        : 'bg-zinc-50 border-zinc-100 cursor-not-allowed opacity-65',
      badge: isCommittee ? 'Admin' : 'Locked',
      path: isCommittee ? `/society/${societyId}/admin` : null
    },
    {
      id: 'new_issue',
      title: 'Raise Issue',
      desc: 'File maintenance complaints',
      icon: <PlusCircle className="w-5 h-5 text-indigo-600" />,
      color: 'from-indigo-600/5 to-indigo-600/10 border-indigo-200/80 hover:border-indigo-400 hover:bg-indigo-600/10',
      badge: 'Quick +',
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
          <div className="relative w-full overflow-hidden py-1.5 group select-none">
            {/* Absolute hovering left arrow */}
            {activeAlertsList.length > 1 && (
              <button
                onClick={handlePrevAlert}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-zinc-950/75 border border-zinc-800 text-white flex items-center justify-center shadow-lg hover:bg-zinc-900 transition-opacity duration-300 opacity-0 group-hover:opacity-100 cursor-pointer pointer-events-auto"
                title="Previous alert"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Absolute hovering right arrow */}
            {activeAlertsList.length > 1 && (
              <button
                onClick={handleNextAlert}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-zinc-950/75 border border-zinc-800 text-white flex items-center justify-center shadow-lg hover:bg-zinc-900 transition-opacity duration-300 opacity-0 group-hover:opacity-100 cursor-pointer pointer-events-auto"
                title="Next alert"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Carousel track wrapper */}
            <div 
              className="flex gap-4 w-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ transform: `translate3d(calc(50% - 140px - ${activeIndex * 296}px), 0, 0)` }}
            >
              {activeAlertsList.map((alert, idx) => {
                const isActive = idx === activeIndex;
                const poster = MockDb.users.find(u => u.id === alert.posted_by);
                const membershipInfo = MockDb.getUserMembership(alert.posted_by, societyId);
                const timeDiffStr = getAlertElapsedTimeText(alert.created_at);

                return (
                  <div
                    key={`${alert.id}-${idx}`}
                    className={`w-[280px] h-[160px] flex-shrink-0 bg-zinc-950/85 border rounded-3xl p-4.5 shadow-xl flex flex-col justify-between backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isActive 
                        ? 'border-indigo-500/50 opacity-100 scale-100 z-10 blur-none shadow-indigo-950/40' 
                        : 'border-zinc-850 opacity-45 scale-90 blur-[1.5px] pointer-events-none'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          alert.severity === 'critical' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
                        }`} />
                        <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${
                          alert.severity === 'critical' 
                            ? 'bg-rose-950/40 text-rose-400 border-rose-900/40' 
                            : 'bg-amber-950/40 text-amber-400 border-amber-900/40'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>

                      {isActive && (
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[8px] font-black uppercase tracking-wider transition cursor-pointer pointer-events-auto"
                        >
                          Resolve
                        </button>
                      )}
                    </div>

                    {/* Message Box */}
                    <div className="text-left h-[48px] overflow-y-auto pr-1 select-text scrollbar-thin scrollbar-thumb-zinc-800">
                      <p className="text-xs font-bold text-white leading-normal">
                        {alert.message}
                      </p>
                    </div>

                    {/* Footer Info */}
                    <div className="border-t border-zinc-900/80 pt-2 flex items-center gap-2 text-left">
                      {poster?.avatar_url ? (
                        <img src={poster.avatar_url} alt={poster.name} className="w-6 h-6 rounded-full object-cover border border-zinc-800" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-zinc-900 text-zinc-450 flex items-center justify-center font-black text-[9px] border border-zinc-800">
                          {poster?.name.charAt(0) || 'U'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-[9px] font-black text-zinc-300 truncate max-w-[150px]">
                          {poster?.name || 'Resident'}
                        </div>
                        <div className="text-[8px] font-medium text-zinc-500">
                          Flat {membershipInfo?.flat_number || 'B-302'} • {timeDiffStr}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom slides indicator dots */}
            {activeAlertsList.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-3">
                {activeAlertsList.map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      i === activeIndex ? 'bg-indigo-500 w-3' : 'bg-zinc-850'
                    }`} 
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-3xl p-5 text-center flex flex-col items-center justify-center gap-2 backdrop-blur-md select-none">
            <span className="text-[10px] font-black text-emerald-450 uppercase tracking-widest bg-emerald-950/30 border border-emerald-900/50 px-3 py-0.5 rounded-full animate-pulse">
              All Safe
            </span>
            <p className="text-xs font-semibold text-zinc-300">🎉 Orchid Heights record is clean! No active security alerts.</p>
          </div>
        )}
      </section>

      {/* Grid of 9 Cards (3x3 layout on larger mobile, responsive) */}
      <section className="space-y-4 z-10 relative">
        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">
          Feature Hub
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCardClick(item)}
              className={`p-4 rounded-2xl cursor-pointer btn-transition flex items-center gap-4 relative shadow-3xs group bg-white/70 backdrop-blur-md border border-white/40 hover:border-indigo-300 hover:bg-white/95 hover:shadow-xs`}
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-zinc-100/80 flex items-center justify-center shadow-3xs group-hover:scale-105 btn-transition flex-shrink-0">
                {item.icon}
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 justify-between">
                  <h4 className="text-xs font-bold text-zinc-800 group-hover:text-indigo-600 btn-transition truncate leading-none">
                    {item.title}
                  </h4>
                  {item.badge && (
                    <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                      item.badge === 'Live Chat' ? 'bg-indigo-50 text-indigo-700' :
                      item.badge === 'Locked' ? 'bg-zinc-100 text-zinc-500' :
                      item.badge === 'Admin' ? 'bg-purple-50 text-purple-700' :
                      'bg-rose-50 text-rose-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 font-bold mt-1 truncate">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
