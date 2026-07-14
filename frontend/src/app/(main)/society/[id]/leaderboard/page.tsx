'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Trophy, ShieldAlert, Award, ChevronRight } from 'lucide-react';
import { MockDb, User } from '@/lib/mockDb';

export default function LeaderboardPage() {
  const params = useParams();
  const router = useRouter();
  const societyId = params?.id as string;

  const [currentUser, setCurrentUser] = useState<User | null>(null);
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

  const leaderboard = MockDb.getBlockLeaderboard(societyId);

  return (
    <div className="p-4 space-y-4 pb-24 min-h-full bg-zinc-50">
      {/* Page Header card */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-2xs">
        <h3 className="text-xs font-black text-zinc-800">Block Wars Standings</h3>
        <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">WING VS WING COOPERATIVE STANDINGS</p>
      </div>

      {/* Leaderboard Header Info */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-2xs space-y-3.5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 text-zinc-900 pointer-events-none">
          <Trophy className="w-40 h-40" />
        </div>
        
        <div className="flex items-center gap-2 text-amber-500">
          <Trophy className="w-5 h-5 animate-bounce" />
          <h4 className="text-xs font-black uppercase tracking-wider">How are scores calculated?</h4>
        </div>
        
        <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
          Standings are updated dynamically based on Wing maintenance payment rates (50%), active SLA complaint resolution speeds (30%), and neighbor vibe scores (20%). High-ranking blocks earn sponsored clubhouse discounts & weekend garden parties!
        </p>
      </div>

      {/* Blocks List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {leaderboard.map((item, idx) => {
          const medals = ['🥇', '🥈', '🥉'];
          const borderStyles = [
            'border-amber-200 bg-amber-50/10 shadow-xs',
            'border-zinc-200 bg-zinc-50/10',
            'border-orange-200 bg-orange-50/10'
          ];
          const scoreColors = [
            'text-amber-600 bg-amber-50 border-amber-100',
            'text-zinc-600 bg-zinc-50 border-zinc-100',
            'text-orange-600 bg-orange-50 border-orange-100'
          ];
          const barColors = ['bg-amber-500', 'bg-zinc-400', 'bg-orange-400'];

          return (
            <div 
              key={item.block} 
              className={`bg-white border rounded-2xl p-4 space-y-3.5 relative overflow-hidden transition-all hover:scale-[1.01] ${borderStyles[idx] || 'border-zinc-100'}`}
            >
              {/* Top line with rank, block name, and overall score */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xl leading-none">{medals[idx] || '🎖️'}</span>
                  <div>
                    <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wide">{item.block}</h4>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Orchid Heights Phase 1</p>
                  </div>
                </div>
                
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${scoreColors[idx] || 'text-zinc-500 bg-zinc-50 border-zinc-100'}`}>
                  {item.score} pts
                </span>
              </div>

              {/* Progress Bar indicator */}
              <div className="space-y-1">
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${barColors[idx] || 'bg-indigo-500'}`} 
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>

              {/* Micro stats metrics */}
              <div className="grid grid-cols-3 gap-2.5 pt-2.5 border-t border-zinc-50/80 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                <div className="flex flex-col gap-0.5">
                  <span>💳 Dues Paid</span>
                  <span className="text-zinc-700 font-extrabold text-xs">{item.paymentRate}%</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span>🛠️ Issues Fixed</span>
                  <span className="text-zinc-700 font-extrabold text-xs">{item.resolutionRate}%</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span>😊 Vibe Score</span>
                  <span className="text-zinc-700 font-extrabold text-xs">{item.avgVibe}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivational Hint banner */}
      <div className="p-4 bg-indigo-50/40 border border-indigo-100/30 rounded-2xl text-center">
        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block mb-1">PRO-TIP FOR WINGS</span>
        <p className="text-[10px] text-indigo-900 leading-relaxed font-semibold">
          Want to beat the top block? Encourage neighbors to resolve outstanding issues quickly and verify finished repairs, or send anonymous nudges to resolve noise & parking friction!
        </p>
      </div>
    </div>
  );
}
