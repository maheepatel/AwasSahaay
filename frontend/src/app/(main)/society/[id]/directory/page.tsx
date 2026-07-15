'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Search, Shield, User as UserIcon, Phone, MapPin, Star, X } from 'lucide-react';
import { MockDb, Membership, User } from '@/lib/mockDb';

export default function DirectoryPage() {
  const params = useParams();
  const router = useRouter();
  const societyId = params?.id as string;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Nudge states
  const [showNudgeSheet, setShowNudgeSheet] = useState(false);
  const [nudgeCategory, setNudgeCategory] = useState<'noise' | 'parking' | 'pet' | 'other'>('noise');
  const [nudgeMsg, setNudgeMsg] = useState('');
  const [nudgeSuccess, setNudgeSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const active = MockDb.getActiveUser();
    if (!active) {
      router.push('/login');
      return;
    }
    setCurrentUser(active);
  }, [router]);

  if (!mounted || !currentUser) return null;

  // Fetch memberships for this society (excluding maintenance heroes/workers)
  const memberships = MockDb.memberships.filter(m => m.society_id === societyId && m.role !== 'worker');
  const users = MockDb.users;

  // Combine user details with membership
  const membersList = memberships.map(mem => {
    const user = users.find(u => u.id === mem.user_id);
    return {
      ...mem,
      name: user?.name || 'Unknown User',
      avatar_url: user?.avatar_url,
      phone: user?.phone || 'No phone',
      userRaw: user
    };
  });

  // Filter based on search query
  const filteredMembers = membersList.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.flat_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort: Committee roles (secretary, treasurer, asst_secretary) first, then residents/tenants, then workers
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    const rolePriority = { secretary: 5, treasurer: 4, asst_secretary: 3, resident: 2, tenant: 1, worker: 0 };
    const aPriority = rolePriority[a.role as keyof typeof rolePriority] || 0;
    const bPriority = rolePriority[b.role as keyof typeof rolePriority] || 0;
    return bPriority - aPriority || a.name.localeCompare(b.name);
  });

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-emerald-500 animate-presence-pulse';
      case 'away': return 'bg-amber-500';
      default: return 'bg-zinc-400';
    }
  };

  const getRoleBadgeStyles = (role: string) => {
    switch (role) {
      case 'secretary': return 'bg-rose-50 border-rose-100 text-rose-700';
      case 'treasurer': return 'bg-amber-50 border-amber-100 text-amber-700';
      case 'asst_secretary': return 'bg-indigo-50 border-indigo-100 text-indigo-700';
      case 'worker': return 'bg-sky-50 border-sky-100 text-sky-700';
      default: return 'bg-zinc-50 border-zinc-100 text-zinc-600';
    }
  };

  const handleMemberClick = (user: User, membership: Membership) => {
    setSelectedMember(user);
    setSelectedMembership(membership);
  };

  const handleSendNudge = () => {
    if (!selectedMembership) return;
    
    let finalMsg = nudgeMsg.trim();
    if (!finalMsg) {
      if (nudgeCategory === 'noise') finalMsg = '🎵 Noise nudge: Please lower the volume/activity noise in your flat.';
      else if (nudgeCategory === 'parking') finalMsg = '🚗 Parking nudge: Your vehicle is encroaching the bay boundaries.';
      else if (nudgeCategory === 'pet') finalMsg = '🐕 Pet nudge: Please watch your pet in common walkways.';
      else finalMsg = '🧹 Litter nudge: Please avoid leaving waste outside the chute/doorway.';
    }

    MockDb.sendNudge(societyId, selectedMembership.flat_number, nudgeCategory, finalMsg);
    
    setNudgeSuccess(true);
    setTimeout(() => {
      setNudgeSuccess(false);
      setShowNudgeSheet(false);
      setNudgeMsg('');
      setSelectedMember(null);
    }, 1800);
  };

  return (
    <div className="p-4 space-y-4 pb-24 min-h-full bg-zinc-50 relative">
      {/* Page Header card */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-2xs">
        <h3 className="text-xs font-black text-zinc-800">Society Directory</h3>
        <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Explore active community members and workers</p>
      </div>

      {/* Search Input bar */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-3 shadow-2xs">
        <div className="relative">
          <input
            type="text"
            placeholder="Search residents, flats, roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold text-zinc-700 shadow-2xs"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
        </div>
      </div>

      {/* Directory items list (Responsive grid) */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-2.5 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-1 bg-white">
        {sortedMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => member.userRaw && handleMemberClick(member.userRaw, member)}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-50 cursor-pointer btn-transition"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                {member.avatar_url ? (
                  <img 
                    src={member.avatar_url} 
                    alt={member.name} 
                    className="w-9 h-9 rounded-full object-cover border border-zinc-100"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {member.name.charAt(0)}
                  </div>
                )}
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white ${getStatusDotColor(member.presence_status)}`} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-zinc-800 truncate leading-snug">
                  {member.name}
                </div>
                {member.role === 'worker' ? (
                  <div className="text-[8px] text-indigo-600 font-black tracking-wide uppercase mt-0.5">
                    ⭐ {member.hero_points ?? 0} pts • ☕ {member.cups_of_chai ?? 0} Chai
                  </div>
                ) : (
                  <div className="text-[9px] text-zinc-400 font-bold truncate">
                    {member.flat_number}
                  </div>
                )}
              </div>
            </div>

            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wide flex-shrink-0 ${getRoleBadgeStyles(member.role)}`}>
              {member.role === 'asst_secretary' ? 'asst sec' : member.role}
            </span>
          </div>
        ))}

        {sortedMembers.length === 0 && (
          <div className="text-center py-12 text-zinc-400 text-xs">
            No matching members found.
          </div>
        )}
      </div>

      {/* Member Details Modal Overlay */}
      {selectedMember && selectedMembership && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-35 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xs p-5 shadow-xl border border-zinc-100 relative animate-scale-up space-y-4">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-3.5 right-3.5 p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center mt-2">
              {selectedMember.avatar_url ? (
                <img 
                  src={selectedMember.avatar_url} 
                  alt={selectedMember.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-50"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xl">
                  {selectedMember.name.charAt(0)}
                </div>
              )}
              
              <h4 className="text-sm font-extrabold text-zinc-900 mt-2 flex items-center gap-1">
                {selectedMember.name}
              </h4>
              <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider mt-1 ${getRoleBadgeStyles(selectedMembership.role)}`}>
                {selectedMembership.role}
              </span>

              <div className="w-full mt-4 space-y-2 text-left border-t border-zinc-100 pt-3 text-xs font-semibold text-zinc-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Flat: <strong className="text-zinc-800">{selectedMembership.flat_number}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Phone: <strong className="text-zinc-800">{selectedMember.phone}</strong></span>
                </div>
                
                {selectedMembership.role !== 'worker' ? (
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-rose-400" />
                    <span>Vibe Score: <strong className="text-rose-600 font-extrabold">{selectedMembership.vibe_score ?? 100}%</strong></span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Hero Points: <strong className="text-zinc-800 font-black">{selectedMembership.hero_points ?? 0} pts</strong></span>
                  </div>
                )}
              </div>

              {/* Nudge Action button (not for worker, and not for myself) */}
              {selectedMembership.role !== 'worker' && selectedMember.id !== currentUser.id && (
                <button
                  onClick={() => setShowNudgeSheet(true)}
                  className="w-full mt-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-xl text-[10px] sm:text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 btn-transition shadow-xs whitespace-nowrap"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Nudge Neighbor Flat</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Nudge Picker Sheet */}
      {showNudgeSheet && selectedMembership && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-xl text-center animate-scale-up border border-zinc-100">
            {!nudgeSuccess ? (
              <>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-zinc-800">Dispatch Anonymous Nudge</h4>
                  <p className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-wider">{selectedMembership.flat_number}</p>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-[9px] font-bold uppercase text-zinc-400">Annoyance Category</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { cat: 'noise', label: '🎵 Noise' },
                      { cat: 'parking', label: '🚗 Parking' },
                      { cat: 'pet', label: '🐕 Pet' },
                      { cat: 'other', label: '🧹 Littering' }
                    ].map((item) => (
                      <button
                        key={item.cat}
                        type="button"
                        onClick={() => setNudgeCategory(item.cat as any)}
                        className={`py-2.5 text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-wide border rounded-xl btn-transition whitespace-nowrap ${
                          nudgeCategory === item.cat
                            ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-2xs'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="block text-[9px] font-bold uppercase text-zinc-400">Optional custom message</label>
                  <input
                    type="text"
                    placeholder="Leave empty for polite default..."
                    value={nudgeMsg}
                    onChange={(e) => setNudgeMsg(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 bg-white"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => setShowNudgeSheet(false)}
                    className="flex-1 py-2.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-500 text-[10px] sm:text-xs md:text-sm font-black uppercase rounded-xl transition whitespace-nowrap"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendNudge}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] sm:text-xs md:text-sm font-black uppercase rounded-xl transition shadow-xs whitespace-nowrap"
                  >
                    Send Nudge
                  </button>
                </div>
              </>
            ) : (
              <div className="py-6 flex flex-col items-center gap-3 animate-scale-up">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center animate-bounce">
                  <Shield className="w-6.5 h-6.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-rose-700 uppercase tracking-widest">Nudge Dispatched</h4>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-1">Sent anonymously to Flat Owner.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
