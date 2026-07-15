'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Search, AlertCircle, Clock, Image as ImageIcon, ChevronRight, Filter } from 'lucide-react';
import { MockDb, Issue, User } from '@/lib/mockDb';

export default function IssuesPage() {
  const params = useParams();
  const router = useRouter();
  const societyId = params?.id as string;

  const [issues, setIssues] = useState<Issue[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('open'); // open, closed, all
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const activeUser = MockDb.getActiveUser();
    if (!activeUser) {
      router.push('/login');
      return;
    }
    setCurrentUser(activeUser);

    // Load issues
    setIssues(MockDb.issues.filter(i => i.society_id === societyId));
  }, [societyId, router]);

  if (!mounted || !currentUser) return null;

  // Categories list
  const categories = ['all', 'water', 'electrical', 'security', 'plumbing', 'civil', 'other'];

  // SLA checking utility
  const isSlaBreached = (issue: Issue) => {
    if (issue.status !== 'raised') return false; // SLA escalates if no action (still in raised status)
    const raisedTime = new Date(issue.raised_at).getTime();
    const nowTime = Date.now();
    const hoursElapsed = (nowTime - raisedTime) / (1000 * 60 * 60);
    return hoursElapsed > issue.sla_hours;
  };

  const getSlaElapsedText = (issue: Issue) => {
    const raisedTime = new Date(issue.raised_at).getTime();
    const nowTime = Date.now();
    const hoursElapsed = Math.floor((nowTime - raisedTime) / (1000 * 60 * 60));
    return `${hoursElapsed} hrs elapsed (Limit: ${issue.sla_hours} hrs)`;
  };

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    // 0. Show only mine filter
    if (showOnlyMine && issue.raised_by !== currentUser.id) return false;

    // 1. Category Filter
    if (selectedCategory !== 'all' && issue.category !== selectedCategory) return false;

    // 2. Status Filter
    if (selectedStatus === 'open' && issue.status === 'verified') return false;
    if (selectedStatus === 'closed' && issue.status !== 'verified') return false;

    // 3. Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const raiser = MockDb.users.find(u => u.id === issue.raised_by);
      const membership = MockDb.getUserMembership(issue.raised_by, societyId);
      
      const descMatch = issue.description.toLowerCase().includes(q);
      const flatMatch = membership?.flat_number.toLowerCase().includes(q) || false;
      const nameMatch = raiser?.name.toLowerCase().includes(q) || false;
      const catMatch = issue.category.toLowerCase().includes(q);

      return descMatch || flatMatch || nameMatch || catMatch;
    }

    return true;
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'water': return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'electrical': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'security': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'plumbing': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'civil': return 'bg-teal-50 text-teal-700 border-teal-100';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  const getStatusColor = (status: string, escalated: boolean) => {
    if (escalated) return 'bg-rose-600 text-white font-bold animate-critical-pulse border-rose-700';
    
    switch (status) {
      case 'raised': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'assigned': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'fixing': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'fixed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'verified': return 'bg-zinc-100 text-zinc-500 border-zinc-200';
      case 'reopened': return 'bg-orange-50 text-orange-700 border-orange-100';
      default: return 'bg-zinc-100 text-zinc-700';
    }
  };

  const getDaysOpen = (issue: Issue) => {
    const start = new Date(issue.raised_at).getTime();
    const end = issue.verified_at ? new Date(issue.verified_at).getTime() : Date.now();
    const diff = Math.max(0, (end - start) / (1000 * 3600 * 24));
    
    if (diff < 1) {
      const hrs = Math.max(1, Math.floor(diff * 24));
      return `${hrs} hr${hrs > 1 ? 's' : ''}`;
    }
    const days = Math.floor(diff);
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Direct Raise Issue Action Card */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-2xs flex justify-between items-center bg-linear-to-r from-indigo-50/40 to-violet-50/10">
        <div>
          <h3 className="text-xs font-black text-zinc-800">Track & Resolve Complaints</h3>
          <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Filing is open to all verified residents</p>
        </div>
        <button
          onClick={() => router.push(`/society/${societyId}/issues/new`)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl btn-transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Complaint</span>
        </button>
      </div>

      {/* Search and Filters top card */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search description, flat, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold text-zinc-700 shadow-2xs"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
        </div>

        {/* Status filters toggles (Horizontally scrollable to prevent congestion) */}
        <div className="flex gap-2 border-b border-zinc-100 pb-2.5 overflow-x-auto no-scrollbar whitespace-nowrap scroll-smooth select-none w-full">
          <button
            onClick={() => setSelectedStatus('open')}
            className={`px-3.5 py-1.5 rounded-xl text-[10.5px] sm:text-xs md:text-sm font-black uppercase tracking-wider border btn-transition ${
              selectedStatus === 'open' 
                ? 'bg-zinc-900 border-zinc-950 text-white shadow-xs' 
                : 'bg-transparent border-zinc-200 text-zinc-500 hover:bg-zinc-50'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setSelectedStatus('closed')}
            className={`px-3.5 py-1.5 rounded-xl text-[10.5px] sm:text-xs md:text-sm font-black uppercase tracking-wider border btn-transition ${
              selectedStatus === 'closed' 
                ? 'bg-zinc-900 border-zinc-950 text-white shadow-xs' 
                : 'bg-transparent border-zinc-200 text-zinc-500 hover:bg-zinc-50'
            }`}
          >
            Resolved
          </button>
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3.5 py-1.5 rounded-xl text-[10.5px] sm:text-xs md:text-sm font-black uppercase tracking-wider border btn-transition cursor-pointer ${
              selectedStatus === 'all' 
                ? 'bg-zinc-900 border-zinc-950 text-white shadow-xs' 
                : 'bg-transparent border-zinc-200 text-zinc-500 hover:bg-zinc-50'
            }`}
          >
            All Logs
          </button>

          <div className="h-6 w-[1px] bg-zinc-200 mx-1 flex-shrink-0" />

          <button
            onClick={() => setShowOnlyMine(!showOnlyMine)}
            className={`px-3.5 py-1.5 rounded-xl text-[10.5px] sm:text-xs md:text-sm font-black uppercase tracking-wider border btn-transition flex items-center gap-1 cursor-pointer whitespace-nowrap ${
              showOnlyMine 
                ? 'bg-indigo-600 border-indigo-700 text-white shadow-sm font-black' 
                : 'bg-transparent border-zinc-200 text-zinc-500 hover:bg-zinc-50'
            }`}
          >
            <span>🙋‍♂️ My Issues</span>
          </button>
        </div>

        {/* Scrollable Category pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-[10px] sm:text-xs md:text-sm font-bold border capitalize whitespace-nowrap btn-transition ${
                selectedCategory === cat 
                  ? 'bg-indigo-600 border-indigo-700 text-white font-extrabold shadow-2xs' 
                  : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Issues list feed (Responsive Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIssues.length > 0 ? (
          filteredIssues.map((issue) => {
            const activeUser = MockDb.getActiveUser();
            const activeMembership = MockDb.getUserMembership(activeUser.id, societyId);
            const isCommittee = ['secretary', 'asst_secretary', 'treasurer'].includes(activeMembership?.role || '');
            const isMyIssue = issue.raised_by === activeUser?.id;
            const showRaiserDetails = !issue.is_anonymous || isMyIssue || isCommittee;

            const raiser = MockDb.users.find(u => u.id === issue.raised_by);
            const membership = MockDb.getUserMembership(issue.raised_by, societyId);
            const escalated = isSlaBreached(issue);

            const displayName = showRaiserDetails ? (raiser?.name || 'Unknown') : 'Anonymous Resident';
            const displayFlat = showRaiserDetails ? (membership?.flat_number || 'Visitor') : 'Hidden Flat';

            return (
              <div
                key={issue.id}
                onClick={() => router.push(`/society/${societyId}/issues/${issue.id}`)}
                className={`bg-white border rounded-2xl overflow-hidden cursor-pointer hover:border-indigo-200 hover:shadow-xs btn-transition group flex flex-col relative ${
                  escalated ? 'border-rose-200 shadow-rose-50 shadow-sm' : 'border-zinc-100'
                }`}
              >
                {/* Flashing SLA warning banner if escalated */}
                {escalated && (
                  <div className="bg-rose-500 text-white px-4 py-1 text-[10px] font-extrabold uppercase flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>SLA Breach Escalation: {getSlaElapsedText(issue)}</span>
                  </div>
                )}

                <div className="p-4 flex flex-col gap-2.5">
                  {/* Category and status badge row */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getCategoryColor(issue.category)}`}>
                        {issue.category}
                      </span>
                      {issue.media_urls.length > 0 && (
                        <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-0.5">
                          <ImageIcon className="w-3 h-3 text-zinc-400" />
                          <span>{issue.media_urls.length}</span>
                        </span>
                      )}
                      {issue.is_anonymous && (
                        <span className="text-[8px] bg-zinc-100 border border-zinc-200 text-zinc-500 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold flex items-center gap-0.5">
                          🔒 Anonymous
                        </span>
                      )}
                    </div>
                    
                    <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getStatusColor(issue.status, escalated)}`}>
                      {escalated ? 'escalated' : issue.status}
                    </span>
                  </div>

                  {/* Complaint Description snippet */}
                  <p className="text-xs font-semibold text-zinc-800 line-clamp-2 leading-relaxed break-words">
                    {issue.description}
                  </p>

                  {/* Footer details (Raiser name, Flat, time open) */}
                  <div className="flex justify-between items-center border-t border-zinc-50 pt-2.5 mt-1 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <span>{displayName}</span>
                      <span>({displayFlat})</span>
                    </div>

                    <div className="flex items-center gap-1 text-zinc-500">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      <span>{getDaysOpen(issue)} open</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-zinc-200 p-6">
            <AlertCircle className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500 font-medium text-sm">No issues found</p>
            <p className="text-zinc-400 text-xs mt-1">
              {searchQuery ? "Try searching for a different keyword." : "Everything is currently in order in this space."}
            </p>
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) to Raise Issue */}
      <button
        onClick={() => router.push(`/society/${societyId}/issues/new`)}
        className="sticky bottom-6 float-right p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-30 z-30 mr-2"
        title="Raise New Complaint"
      >
        <Plus className="w-6.5 h-6.5" />
      </button>
    </div>
  );
}
