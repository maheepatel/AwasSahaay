'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ShieldCheck, Sparkles, Key, AlertCircle } from 'lucide-react';
import { MockDb } from '@/lib/mockDb';
import ParticleBackground from '@/components/ParticleBackground';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Default seed accounts for sandbox login testing
  const seedAccounts = [
    { name: 'Rajesh Malhotra', role: 'Secretary', email: 'rajesh@society.com', pass: 'password123', userId: 'usr-rajesh-malhotra' },
    { name: 'Priya Sharma', role: 'Resident', email: 'priya@society.com', pass: 'password123', userId: 'usr-priya-sharma' },
    { name: 'Vikram Patel', role: 'Resident', email: 'vikram@society.com', pass: 'password123', userId: 'usr-vikram-patel' },
    { name: 'Amit Kumar', role: 'Hero Plumber', email: 'amit@society.com', pass: 'password123', userId: 'usr-amit-kumar' }
  ];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // 1. Check if email matches one of our seed accounts
      const matchedSeed = seedAccounts.find(acc => acc.email.toLowerCase() === email.toLowerCase());

      if (matchedSeed) {
        if (password !== matchedSeed.pass) {
          setError('Invalid password. Hint: Use password123');
          setLoading(false);
          return;
        }
        MockDb.setActiveUser(matchedSeed.userId);
        setLoading(false);
        router.push('/');
        return;
      }

      // 2. Fallback sandbox: if not a seed account, allow sign in as a new user with any password
      if (email.includes('@') && password.length >= 6) {
        const mockUsers = MockDb.users;
        let user = mockUsers.find(u => u.phone.includes(email.split('@')[0]));

        if (!user) {
          const newId = 'usr-' + Math.random().toString(36).substr(2, 9);
          user = {
            id: newId,
            phone: `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
            name: email.split('@')[0].toUpperCase(),
            avatar_url: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 9000000)}?auto=format&fit=crop&w=150&h=150&q=80`,
            created_at: new Date().toISOString()
          };
          
          const list = [...MockDb.users, user];
          MockDb.users = list;

          const mems = MockDb.memberships;
          mems.push({
            id: 'mem-' + Math.random().toString(36).substr(2, 9),
            user_id: user.id,
            society_id: 'soc-orchid-heights',
            role: 'resident',
            flat_number: `C-${Math.floor(Math.random() * 12 + 1)}0${Math.floor(Math.random() * 8 + 1)}`,
            is_verified: true,
            presence_status: 'online',
            last_seen: new Date().toISOString()
          });
          MockDb.memberships = mems;
        }

        MockDb.setActiveUser(user.id);
        setLoading(false);
        router.push('/');
      } else {
        setError('Please enter a valid email address and a password of at least 6 characters.');
        setLoading(false);
      }
    }, 1000);
  };

  const autofill = (acc: typeof seedAccounts[0]) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setError('');
  };

  return (
    <div className="flex-1 flex flex-col justify-center min-h-screen px-6 py-12 relative overflow-hidden select-none">
      {/* Constellation Particle Background */}
      <ParticleBackground />

      <div className="mx-auto w-full max-w-sm flex flex-col items-center z-10">
        {/* Brand Icon & Title */}
        <div className="relative mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <ShieldCheck className="w-9 h-9 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 p-1 rounded-full shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        <h2 className="text-3xl font-black tracking-tight text-zinc-900 text-center">
          AwasSahaay
        </h2>
        <p className="mt-2 text-xs text-zinc-550 text-center max-w-xs font-bold uppercase tracking-wider">
          Society Management & Alerts
        </p>

        {/* Card Body */}
        <div className="mt-6 w-full bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-zinc-150 shadow-lg space-y-4">
          <h3 className="text-xs font-black uppercase text-zinc-400 tracking-widest text-center">
            Sign In
          </h3>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email field */}
            <div className="space-y-1">
              <label className="block text-[8px] font-black uppercase text-zinc-400 tracking-wider">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-3xs">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@society.com"
                  className="block w-full pl-10 pr-3 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold text-zinc-800 bg-white"
                  disabled={loading}
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1">
              <label className="block text-[8px] font-black uppercase text-zinc-400 tracking-wider">
                Password
              </label>
              <div className="relative rounded-xl shadow-3xs">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold text-zinc-800 bg-white"
                  disabled={loading}
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-black rounded-xl text-[11px] sm:text-xs md:text-sm flex items-center justify-center gap-2 btn-transition shadow-sm cursor-pointer whitespace-nowrap"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Test credentials helper container */}
          <div className="border-t border-zinc-100 pt-4 space-y-2">
            <div className="flex items-center gap-1 text-[8px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-md border border-amber-100/50 w-max mx-auto">
              <Key className="w-3 h-3 text-amber-500" />
              <span>Click a Seed account to auto-fill:</span>
            </div>
            
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {seedAccounts.map((acc) => (
                <button
                  key={acc.userId}
                  onClick={() => autofill(acc)}
                  className="p-2 border border-zinc-150 rounded-xl bg-zinc-50/50 hover:bg-indigo-50/50 hover:border-indigo-200 text-left transition cursor-pointer"
                >
                  <div className="text-[9px] font-black text-zinc-800 leading-none truncate">{acc.name}</div>
                  <div className="text-[7px] text-zinc-450 font-bold uppercase tracking-wide mt-1 leading-none">
                    {acc.role}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
