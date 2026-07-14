'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShieldCheck, UserCheck, UserPlus, Trash2, CheckCircle2, UserX } from 'lucide-react';
import { MockDb, User, Membership } from '@/lib/mockDb';

export default function AdminPanelPage() {
  const params = useParams();
  const router = useRouter();
  const societyId = params?.id as string;

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unverifiedMembers, setUnverifiedMembers] = useState<any[]>([]);
  const [verifiedMembers, setVerifiedMembers] = useState<any[]>([]);
  
  // Add Member Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [role, setRole] = useState<'resident' | 'tenant' | 'secretary' | 'treasurer' | 'worker'>('resident');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [mounted, setMounted] = useState(false);

  const loadData = () => {
    const activeUser = MockDb.getActiveUser();
    if (!activeUser) {
      router.push('/login');
      return;
    }
    setCurrentUser(activeUser);

    const mem = MockDb.getUserMembership(activeUser.id, societyId);
    if (!mem || !['secretary', 'treasurer'].includes(mem.role)) {
      // Not admin, redirect to issues feed!
      router.push(`/society/${societyId}/issues`);
      return;
    }
    setIsAdmin(true);

    // Get members
    const allMems = MockDb.memberships.filter(m => m.society_id === societyId);
    const allUsers = MockDb.users;

    const merged = allMems.map(m => {
      const u = allUsers.find(user => user.id === m.user_id);
      return {
        ...m,
        name: u?.name || 'Unknown User',
        phone: u?.phone || ''
      };
    });

    setUnverifiedMembers(merged.filter(m => !m.is_verified));
    setVerifiedMembers(merged.filter(m => m.is_verified));
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [societyId, router]);

  if (!mounted || !currentUser || !isAdmin) return null;

  const handleVerify = (memId: string) => {
    MockDb.verifyMembership(memId);
    setSuccessMsg('Member identity verified successfully!');
    loadData();
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleReject = (memId: string) => {
    const list = MockDb.memberships;
    const filtered = list.filter(m => m.id !== memId);
    MockDb.memberships = filtered;
    setSuccessMsg('Registration request declined.');
    loadData();
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !flatNumber.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      // Add formatting to phone if missing prefix
      let formattedPhone = phone.trim();
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+91${formattedPhone.replace(/\D/g, '')}`;
      }

      MockDb.addMembership(
        {
          name: name.trim(),
          phone: formattedPhone
        },
        {
          role,
          flat_number: flatNumber.trim(),
          presence_status: 'offline'
        },
        societyId
      );

      setName('');
      setPhone('');
      setFlatNumber('');
      setRole('resident');
      setSubmitting(false);
      setSuccessMsg('New trusted member added and verified successfully!');
      loadData();
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 1000);
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Top Header Card */}
      <div className="flex items-center gap-2 bg-white border border-zinc-100 rounded-2xl p-4 shadow-2xs">
        <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider">Admin Control Center</h3>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Verified Membership Directory</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-slide-down">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. Verification Queue section */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-2xs space-y-4">
        <h4 className="text-xs font-extrabold text-zinc-500 uppercase tracking-widest border-b border-zinc-50 pb-2">
          Registration Requests ({unverifiedMembers.length})
        </h4>

        <div className="space-y-3">
          {unverifiedMembers.length > 0 ? (
            unverifiedMembers.map((mem) => (
              <div key={mem.id} className="bg-zinc-50 border border-zinc-100 rounded-xl p-3.5 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-xs font-bold text-zinc-800">{mem.name}</h5>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Flat: {mem.flat_number}</p>
                    <p className="text-[10px] text-zinc-400 font-bold mt-0.5">Phone: {mem.phone}</p>
                  </div>
                  <span className="text-[8px] font-black bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100 uppercase tracking-wider">
                    {mem.role}
                  </span>
                </div>
                
                <div className="flex gap-2 border-t border-zinc-200/50 pt-2.5">
                  <button
                    onClick={() => handleVerify(mem.id)}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 btn-transition"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Approve & Verify</span>
                  </button>
                  <button
                    onClick={() => handleReject(mem.id)}
                    className="py-1.5 px-3 bg-zinc-200 hover:bg-rose-50 text-zinc-600 hover:text-rose-600 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 btn-transition border border-transparent hover:border-rose-100"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-zinc-400 italic text-center py-4">No pending identity verifications in queue</p>
          )}
        </div>
      </div>

      {/* 2. Add member directly form */}
      <form onSubmit={handleAddMember} className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-2xs space-y-4">
        <h4 className="text-xs font-extrabold text-zinc-500 uppercase tracking-widest border-b border-zinc-50 pb-2 flex items-center gap-1.5">
          <UserPlus className="w-4 h-4 text-zinc-400" />
          <span>Add Verified Member</span>
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase text-zinc-400">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Rahul Gupta"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 bg-white"
              disabled={submitting}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase text-zinc-400">Flat/Apartment</label>
            <input
              type="text"
              placeholder="e.g. Block A-302"
              value={flatNumber}
              onChange={(e) => setFlatNumber(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 bg-white"
              disabled={submitting}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase text-zinc-400">Mobile Number</label>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 bg-white"
              disabled={submitting}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase text-zinc-400">Group Role</label>
            <select
              value={role}
              onChange={(e: any) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 bg-white"
              disabled={submitting}
            >
              <option value="resident">Resident Owner</option>
              <option value="tenant">Tenant</option>
              <option value="secretary">Secretary (Admin)</option>
              <option value="treasurer">Treasurer (Admin)</option>
              <option value="worker">Vendor Maintenance Staff</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 btn-transition shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add & Provision Access</span>
        </button>
      </form>
    </div>
  );
}
