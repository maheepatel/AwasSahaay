'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Megaphone, 
  AlertTriangle, 
  ShieldAlert, 
  MessageSquare, 
  ChevronLeft, 
  User as UserIcon,
  Circle,
  X,
  Trophy,
  Users,
  Wrench
} from 'lucide-react';
import { MockDb, Society, User } from '@/lib/mockDb';

interface ChannelSidebarProps {
  society: Society;
  currentUser: User;
  onClose?: () => void; // for mobile drawer close trigger
}

export default function ChannelSidebar({ society, currentUser, onClose }: ChannelSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [presence, setPresence] = useState(
    MockDb.getUserMembership(currentUser.id, society.id)?.presence_status || 'online'
  );

  const currentMembership = MockDb.getUserMembership(currentUser.id, society.id);

  const channels = [
    { 
      id: 'general', 
      label: '💬 General Chat', 
      path: `/society/${society.id}/general`,
      icon: <MessageSquare className="w-4 h-4" /> 
    },
    { 
      id: 'alerts', 
      label: '📌 Community Alerts', 
      path: `/society/${society.id}/alerts`,
      icon: <Megaphone className="w-4 h-4" /> 
    },
    { 
      id: 'announcements', 
      label: '📢 Announcements', 
      path: `/society/${society.id}/announcements`,
      icon: <ShieldAlert className="w-4 h-4" /> 
    },
    { 
      id: 'issues', 
      label: '⚠ Issue Tracking', 
      path: `/society/${society.id}/issues`,
      icon: <AlertTriangle className="w-4 h-4" /> 
    },
    { 
      id: 'feedback', 
      label: '💬 Member Feedback', 
      path: `/society/${society.id}/feedback`,
      icon: <MessageSquare className="w-4 h-4" /> 
    },
    { 
      id: 'leaderboard', 
      label: '🏆 Block Standings', 
      path: `/society/${society.id}/leaderboard`,
      icon: <Trophy className="w-4 h-4 text-amber-500" /> 
    },
    { 
      id: 'directory', 
      label: '👥 Members Directory', 
      path: `/society/${society.id}/directory`,
      icon: <Users className="w-4 h-4 text-indigo-400" /> 
    },
    { 
      id: 'workers', 
      label: '🛠️ Maintenance Heroes', 
      path: `/society/${society.id}/workers`,
      icon: <Wrench className="w-4 h-4 text-sky-400" /> 
    },
  ];

  if (currentMembership && ['secretary', 'treasurer'].includes(currentMembership.role)) {
    channels.push({
      id: 'admin',
      label: '⚙ Admin Panel',
      path: `/society/${society.id}/admin`,
      icon: <ShieldAlert className="w-4 h-4 text-rose-500" />
    });
  }

  const handlePresenceChange = (newStatus: 'online' | 'offline' | 'away') => {
    setPresence(newStatus);
    const mems = MockDb.memberships;
    const idx = mems.findIndex(m => m.user_id === currentUser.id && m.society_id === society.id);
    if (idx !== -1) {
      mems[idx].presence_status = newStatus;
      mems[idx].last_seen = new Date().toISOString();
      MockDb.memberships = mems;
    }
  };


  return (
    <div className="w-64 min-w-[16rem] max-w-[16rem] h-full bg-zinc-950 text-zinc-300 flex flex-col border-r border-zinc-800">
      {/* Sidebar Header */}
      <div className="px-4 py-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/40">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-bold transition"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Exit Space</span>
        </button>
        {onClose && (
          <button 
            onClick={onClose}
            className="md:hidden p-1 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-900"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="px-4 py-3 bg-zinc-900/50">
        <h2 className="text-sm font-black text-white truncate uppercase tracking-wide">
          {society.name}
        </h2>
        <p className="text-[10px] text-zinc-500 font-bold mt-0.5 truncate uppercase">
          {society.city}
        </p>
      </div>

      {/* Channel list */}
      <nav className="flex-1 px-2 py-4 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider px-3 mb-2">
          Channels
        </div>
        {channels.map((chan) => {
          // Check if active: path matches or starts with path
          const isActive = pathname.startsWith(chan.path);

          return (
            <Link
              key={chan.id}
              href={chan.path}
              onClick={onClose}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide border transition-all ${
                isActive 
                  ? 'bg-indigo-600 border-indigo-700 text-white shadow-xs font-bold' 
                  : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              {chan.icon}
              <span>{chan.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile & presence control card */}
      <div className="p-3 border-t border-zinc-900 bg-zinc-900/40">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            {currentUser.avatar_url ? (
              <img 
                src={currentUser.avatar_url} 
                alt={currentUser.name} 
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-zinc-800 text-white flex items-center justify-center font-bold">
                {currentUser.name.charAt(0)}
              </div>
            )}
            
            {/* Status dot overlay */}
            <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-zinc-950 flex items-center justify-center ${
              presence === 'online' ? 'bg-emerald-500 animate-presence-pulse' :
              presence === 'away' ? 'bg-amber-500' : 'bg-zinc-500'
            }`} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate leading-tight">
              {currentUser.name}
            </div>
            <div className="text-[10px] text-zinc-500 truncate mt-0.5 font-bold uppercase flex items-center gap-1">
              <span>{currentMembership?.flat_number || 'Visitor'}</span>
              <span>•</span>
              <span className="text-indigo-400 capitalize">{currentMembership?.role}</span>
            </div>
          </div>
        </div>

        {/* Quick Presence Toggle options */}
        <div className="mt-3 flex items-center justify-between border-t border-zinc-800/60 pt-2 text-[10px] font-bold text-zinc-500">
          <span>Set Status:</span>
          <div className="flex gap-2.5">
            <button 
              onClick={() => handlePresenceChange('online')}
              className={`p-1 flex items-center gap-0.5 hover:text-emerald-400 ${presence === 'online' ? 'text-emerald-400' : ''}`}
              title="Online"
            >
              <Circle className="w-2.5 h-2.5 fill-current" />
            </button>
            <button 
              onClick={() => handlePresenceChange('away')}
              className={`p-1 flex items-center gap-0.5 hover:text-amber-400 ${presence === 'away' ? 'text-amber-400' : ''}`}
              title="Away"
            >
              <Circle className="w-2.5 h-2.5 fill-current" />
            </button>
            <button 
              onClick={() => handlePresenceChange('offline')}
              className={`p-1 flex items-center gap-0.5 hover:text-zinc-400 ${presence === 'offline' ? 'text-zinc-400' : ''}`}
              title="Offline"
            >
              <Circle className="w-2.5 h-2.5 fill-current" />
            </button>
          </div>
        </div>

        {/* User Swapper Dropdown */}
        <div className="mt-3.5 pt-2.5 border-t border-zinc-800/60 space-y-1">
          <label className="block text-[8px] font-black uppercase text-zinc-500 tracking-wider">
            Switch Perspective
          </label>
          <select
            value={currentUser.id}
            onChange={(e) => {
              MockDb.setActiveUser(e.target.value);
              window.location.reload();
            }}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-1 px-1.5 text-[10px] font-bold text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {MockDb.users.map(u => {
              const uMem = MockDb.getUserMembership(u.id, society.id);
              if (!uMem) return null;
              
              const roleLabel = uMem.role === 'secretary' ? 'Secretary' :
                                uMem.role === 'treasurer' ? 'Treasurer' :
                                uMem.role === 'worker' ? 'Hero' : 'Resident';
                                
              return (
                <option key={u.id} value={u.id}>
                  {u.name} ({roleLabel})
                </option>
              );
            })}
          </select>

          <button
            onClick={() => {
              if (confirm("Reset local database to default seed values? This will reset all accounts and stats.")) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="w-full text-center text-[8px] font-extrabold text-zinc-600 hover:text-rose-400 mt-2.5 uppercase tracking-wider transition"
          >
            Reset Database State
          </button>
        </div>
      </div>
    </div>
  );
}
