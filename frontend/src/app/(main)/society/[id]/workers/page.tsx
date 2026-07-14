'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, Phone, MessageSquare, Heart, X, MapPin } from 'lucide-react';
import { MockDb, Membership, User } from '@/lib/mockDb';

export default function WorkersPage() {
  const params = useParams();
  const router = useRouter();
  const societyId = params?.id as string;

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<User | null>(null);
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
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

  // Filter members who have the role of 'worker'
  const memberships = MockDb.memberships.filter(m => m.society_id === societyId && m.role === 'worker');
  const users = MockDb.users;

  const workersList = memberships.map(mem => {
    const user = users.find(u => u.id === mem.user_id);
    return {
      ...mem,
      name: user?.name || 'Unknown Staff',
      avatar_url: user?.avatar_url,
      phone: user?.phone || 'No phone',
      userRaw: user
    };
  });

  const getWorkerRoleLabel = (phone: string) => {
    if (phone.includes('000001')) return 'Plumber';
    if (phone.includes('000002')) return 'Electrician';
    if (phone.includes('000003')) return 'Gardener & Landscaper';
    if (phone.includes('000004')) return 'Elevator Operator';
    if (phone.includes('000005')) return 'Security Guard';
    return 'Maintenance Staff';
  };

  const handleWorkerClick = (user: User, membership: Membership) => {
    setSelectedWorker(user);
    setSelectedMembership(membership);
  };

  return (
    <div className="p-4 space-y-4 pb-24 min-h-full bg-zinc-50 relative">
      {/* Page Header card */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-2xs">
        <h3 className="text-xs font-black text-zinc-800">Maintenance Heroes</h3>
        <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Click any staff member to view stats and tips</p>
      </div>

      {/* Simplified Clean List (Responsive Grid) */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-2.5 shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-white">
        {workersList.map((worker) => (
          <div
            key={worker.id}
            onClick={() => worker.userRaw && handleWorkerClick(worker.userRaw, worker)}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 cursor-pointer btn-transition"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {worker.userRaw?.avatar_url ? (
                <img 
                  src={worker.userRaw.avatar_url} 
                  alt={worker.name} 
                  className="w-10 h-10 rounded-xl object-cover border border-zinc-150 flex-shrink-0 shadow-3xs"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-sky-50 to-indigo-50/30 border border-sky-100 flex items-center justify-center font-black text-sky-700 flex-shrink-0">
                  {worker.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-zinc-800 truncate">{worker.name}</h4>
                <p className="text-[10px] text-indigo-600 font-bold tracking-wide uppercase mt-0.5">
                  {getWorkerRoleLabel(worker.phone)}
                </p>
              </div>
            </div>
            
            <div className="text-[9px] text-zinc-400 font-extrabold uppercase bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-100">
              View Stats
            </div>
          </div>
        ))}

        {workersList.length === 0 && (
          <div className="text-center py-12 text-zinc-400 text-xs">
            No maintenance workers registered yet.
          </div>
        )}
      </div>

      {/* Workers Profile Details Modal Overlay */}
      {selectedWorker && selectedMembership && (() => {
        const claimedCount = MockDb.issues.filter(i => i.assigned_to === selectedWorker.id && i.status !== 'verified').length;
        
        return (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-35 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-xs p-5 shadow-xl border border-zinc-100 relative animate-scale-up space-y-4 text-center">
              <button
                onClick={() => setSelectedWorker(null)}
                className="absolute top-3.5 right-3.5 p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center mt-2">
                {selectedWorker.avatar_url ? (
                  <img 
                    src={selectedWorker.avatar_url} 
                    alt={selectedWorker.name} 
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-50 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xl">
                    {selectedWorker.name.charAt(0)}
                  </div>
                )}
                
                <h4 className="text-sm font-extrabold text-zinc-900 mt-2">
                  {selectedWorker.name}
                </h4>
                <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border border-sky-100 bg-sky-50 text-sky-700 uppercase tracking-wider mt-1.5 inline-block">
                  {getWorkerRoleLabel(selectedWorker.phone)}
                </span>

                <div className="w-full mt-4 space-y-2.5 text-left border-t border-zinc-100 pt-3 text-xs font-semibold text-zinc-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Office: <strong className="text-zinc-800">{selectedMembership.flat_number}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Phone: <strong className="text-zinc-800">{selectedWorker.phone}</strong></span>
                  </div>
                </div>

                {/* Performance stats grid */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-zinc-100 w-full mt-4 text-center text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                  <div className="flex flex-col gap-0.5 border-r border-zinc-100">
                    <span>⭐ Hero Score</span>
                    <span className="text-zinc-800 font-black text-xs">{selectedMembership.hero_points ?? 0} pts</span>
                  </div>
                  <div className="flex flex-col gap-0.5 border-r border-zinc-100">
                    <span>☕ Chai Tips</span>
                    <span className="text-zinc-800 font-black text-xs">{selectedMembership.cups_of_chai ?? 0} Recd</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span>🛠️ Active Jobs</span>
                    <span className="text-zinc-800 font-black text-xs">{claimedCount} Claims</span>
                  </div>
                </div>

                {/* Call / Chat Actions */}
                <div className="flex gap-2 w-full mt-4 text-[10px] font-black uppercase tracking-wider">
                  <a 
                    href={`tel:${selectedWorker.phone}`}
                    className="flex-1 py-2.5 border border-zinc-200 hover:bg-zinc-50 rounded-xl flex items-center justify-center gap-1 text-zinc-600 transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Call Staff</span>
                  </a>
                  <button
                    onClick={() => {
                      setSelectedWorker(null);
                      router.push(`/society/${societyId}/general`);
                    }}
                    className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-950 text-white rounded-xl flex items-center justify-center gap-1 transition shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat Message</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
