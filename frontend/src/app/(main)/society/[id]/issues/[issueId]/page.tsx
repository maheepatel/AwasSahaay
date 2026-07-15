'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, UserCheck, Play, CheckCircle, RotateCcw, FileSpreadsheet, Camera, Image as ImageIcon, Star, KeyRound } from 'lucide-react';
import { MockDb, Issue, IssueActivityLog, User, Membership } from '@/lib/mockDb';
import IssueStatusStepper from '@/components/IssueStatusStepper';

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const societyId = params?.id as string;
  const issueId = params?.issueId as string;

  const [issue, setIssue] = useState<Issue | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<IssueActivityLog[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  
  // Transition Form States
  const [note, setNote] = useState('');
  const [proofPhotos, setProofPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [tipAmount, setTipAmount] = useState(0);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiPaying, setUpiPaying] = useState(false);
  const [upiSuccess, setUpiSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  const loadData = () => {
    const activeUser = MockDb.getActiveUser();
    if (!activeUser) {
      router.push('/login');
      return;
    }
    setCurrentUser(activeUser);

    if (!selectedAssignee) {
      setSelectedAssignee(activeUser.id);
    }

    const mem = MockDb.getUserMembership(activeUser.id, societyId);
    if (mem) {
      setUserRole(mem.role);
    }

    const iss = MockDb.issues.find(i => i.id === issueId);
    if (!iss) {
      router.push(`/society/${societyId}/issues`);
      return;
    }
    setIssue(iss);

    // Load append-only logs sorted by date
    const issLogs = MockDb.logs.filter(l => l.issue_id === issueId).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    setLogs(issLogs);
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [societyId, issueId, router]);

  if (!mounted || !issue || !currentUser) return null;

  const isCommittee = ['secretary', 'asst_secretary', 'treasurer'].includes(userRole);
  const isRaiser = issue.raised_by === currentUser.id;

  // Actions
  const handleAssign = () => {
    if (!selectedAssignee) return;
    setActionLoading(true);
    const assigneeObj = MockDb.users.find(u => u.id === selectedAssignee);
    const noteText = `Issue assigned to ${assigneeObj?.name || 'worker'}`;
    setTimeout(() => {
      MockDb.updateIssueStatus(issueId, 'assigned', currentUser.id, noteText, [], selectedAssignee);
      loadData();
      setActionLoading(false);
    }, 800);
  };

  const handleStartFixing = () => {
    setActionLoading(true);
    setTimeout(() => {
      MockDb.updateIssueStatus(issueId, 'fixing', currentUser.id, 'Work started on the resolution');
      loadData();
      setActionLoading(false);
    }, 800);
  };

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setUploading(true);

    const files = Array.from(e.target.files);
    const promises = files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(base64Images => {
      setProofPhotos(prev => [...prev, ...base64Images]);
      setUploading(false);
    });
  };

  const handleMarkFixed = (e: React.FormEvent) => {
    e.preventDefault();
    if (proofPhotos.length === 0) {
      alert('Photo proof of resolution is REQUIRED to mark the issue as fixed.');
      return;
    }

    setActionLoading(true);
    setTimeout(() => {
      MockDb.updateIssueStatus(
        issueId, 
        'fixed', 
        currentUser.id, 
        note ? `Issue resolved: ${note}` : 'Issue marked fixed with photo proof', 
        proofPhotos
      );
      setNote('');
      setProofPhotos([]);
      loadData();
      setActionLoading(false);
    }, 1000);
  };

  const handleVerifyClose = () => {
    if (tipAmount > 0) {
      setShowUpiModal(true);
    } else {
      executeVerifyClose(0);
    }
  };

  const executeVerifyClose = (finalTip: number) => {
    setActionLoading(true);
    const closeNote = note ? note.trim() : `Resolution verified. Rated ${rating} stars.`;
    setTimeout(() => {
      MockDb.rateAndCloseIssue(issueId, rating, finalTip, currentUser.id, closeNote);
      loadData();
      setActionLoading(false);
      setShowUpiModal(false);
      setUpiPaying(false);
      setUpiSuccess(false);
    }, 800);
  };

  const handleUpiPay = () => {
    setUpiPaying(true);
    setTimeout(() => {
      setUpiPaying(false);
      setUpiSuccess(true);
      setTimeout(() => {
        executeVerifyClose(tipAmount);
      }, 1500);
    }, 2000);
  };

  const handleReopen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) {
      alert('Please specify a reason/note to reopen the issue.');
      return;
    }

    setActionLoading(true);
    setTimeout(() => {
      MockDb.updateIssueStatus(issueId, 'reopened', currentUser.id, `Issue Reopened: ${note}`);
      setNote('');
      loadData();
      setActionLoading(false);
    }, 1000);
  };

  const getActionName = (action: string) => {
    switch (action) {
      case 'raised': return 'Submitted Complaint';
      case 'assigned': return 'Assigned Worker';
      case 'fixing': return 'Started Repairs';
      case 'fixed': return 'Marked Work Done';
      case 'verified': return 'Verified & Closed';
      case 'reopened': return 'Disputed / Reopened';
      default: return action;
    }
  };

  const isSecretary = userRole === 'secretary';

  // Filter candidates for assignment (workers, secretary, treasurer)
  const candidates = MockDb.memberships
    .filter(m => m.society_id === societyId && ['worker', 'secretary', 'treasurer'].includes(m.role))
    .map(m => {
      const u = MockDb.users.find(user => user.id === m.user_id);
      return {
        id: m.user_id,
        name: u?.name || 'Unknown',
        role: m.role
      };
    });

  return (
    <div className="p-5 pb-24 space-y-6">
      {/* Detail Header navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/society/${societyId}/issues`)}
          className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-xl btn-transition border border-zinc-200 bg-white"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>
        <div>
          <h2 className="text-base font-extrabold text-zinc-900">
            Issue Tracker
          </h2>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
            ID: {issue.id}
          </p>
        </div>
      </div>

      {/* 2. Original Complaint Details Card */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-2xs space-y-4 animate-fade-in">
        <div className="flex justify-between items-center border-b border-zinc-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${
              issue.category === 'plumbing' ? 'bg-sky-50 border-sky-100 text-sky-700' :
              issue.category === 'electrical' ? 'bg-amber-50 border-amber-100 text-amber-700' :
              issue.category === 'water' ? 'bg-blue-50 border-blue-100 text-blue-700' :
              issue.category === 'security' ? 'bg-rose-50 border-rose-100 text-rose-700' :
              'bg-zinc-50 border-zinc-200 text-zinc-600'
            }`}>
              {issue.category}
            </span>
            {issue.is_anonymous && (
              <span className="text-[8px] bg-zinc-100 border border-zinc-200 text-zinc-500 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold flex items-center gap-0.5">
                🔒 Anonymous
              </span>
            )}
          </div>
          <span className="text-[9px] text-zinc-400 font-extrabold uppercase">
            {new Date(issue.raised_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="space-y-1">
          <label className="block text-[8px] font-black uppercase text-zinc-400 tracking-wider">Complaint Description</label>
          <p className="text-xs font-semibold text-zinc-700 leading-relaxed break-words">
            "{issue.description}"
          </p>
        </div>

        {/* Raiser Metadata (Anonymity Aware) */}
        <div className="text-[10px] text-zinc-400 font-bold flex justify-between items-center border-t border-zinc-50 pt-2.5">
          <div>
            <span>Raised by: </span>
            <strong className="text-zinc-500">
              {(() => {
                const raiser = MockDb.users.find(u => u.id === issue.raised_by);
                const membership = MockDb.getUserMembership(issue.raised_by, societyId);
                const isMyIssue = issue.raised_by === currentUser.id;
                const showRaiser = !issue.is_anonymous || isMyIssue || isCommittee;
                
                return showRaiser 
                  ? `${raiser?.name || 'Unknown'} (${membership?.flat_number || 'Visitor'})`
                  : 'Anonymous Resident (Hidden Flat)';
              })()}
            </strong>
          </div>
        </div>

        {/* Uploaded media files */}
        {issue.media_urls && issue.media_urls.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-zinc-50">
            <label className="block text-[8px] font-black uppercase text-zinc-400 tracking-wider">Attachments ({issue.media_urls.length})</label>
            <div className="flex flex-wrap gap-2">
              {issue.media_urls.map((url, idx) => (
                <a 
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-lg overflow-hidden border border-zinc-200 block hover:opacity-80 transition"
                >
                  <img src={url} alt={`attachment-${idx}`} className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Order Tracker Visual Card */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-2xs space-y-5">
        <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-2">
          Tracking Progress
        </h3>
        <IssueStatusStepper issue={issue} />
      </div>

      {/* Action panel depending on state and user roles */}
      {issue.status !== 'verified' && (
        <div className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-2xs space-y-4">
          <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-2">
            Resolve Actions
          </h3>

          {/* 1. ASSIGNMENT ACTION (Committee only) */}
          {issue.status === 'raised' && isCommittee && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                Assign this issue to a maintenance vendor or a committee administrator.
              </p>
              
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-zinc-400">Select Assignee</label>
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 bg-white"
                  disabled={actionLoading}
                >
                  <option value="">-- Choose Worker / Admin --</option>
                  {candidates.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.role === 'worker' ? 'Vendor Staff' : 'Admin'})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAssign}
                disabled={actionLoading || !selectedAssignee}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-black rounded-xl text-[11px] sm:text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 btn-transition whitespace-nowrap"
              >
                <UserCheck className="w-4 h-4" />
                <span>Assign Issue</span>
              </button>
            </div>
          )}

          {/* 2. START WORK ACTION (Assignee only) */}
          {issue.status === 'assigned' && issue.assigned_to === currentUser.id && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                Let residents know that repairs are starting by advancing status to 'Fixing'.
              </p>
              <button
                onClick={handleStartFixing}
                disabled={actionLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-black rounded-xl text-[11px] sm:text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 btn-transition whitespace-nowrap"
              >
                <Play className="w-4 h-4" />
                <span>Start Fixing</span>
              </button>
            </div>
          )}

          {/* 3. MARK FIXED FORM ACTION (Assignee only) */}
          {issue.status === 'fixing' && issue.assigned_to === currentUser.id && (
            <form onSubmit={handleMarkFixed} className="space-y-3">
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                Repairs finished? Upload proof photos (mandatory) and add a resolution note to complete the task.
              </p>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1.5">
                  Resolution Proof Photo (Camera/Upload)
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="w-14 h-14 border border-dashed border-zinc-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 bg-zinc-50 btn-transition">
                    <Camera className="w-4 h-4 text-zinc-400" />
                    <span className="text-[8px] font-bold text-zinc-400 uppercase mt-0.5">Camera</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      onChange={handleProofUpload}
                      className="hidden"
                      disabled={uploading || actionLoading}
                    />
                  </label>
                  <label className="w-14 h-14 border border-dashed border-zinc-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 bg-zinc-50 btn-transition">
                    <ImageIcon className="w-4 h-4 text-zinc-400" />
                    <span className="text-[8px] font-bold text-zinc-400 uppercase mt-0.5">Gallery</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleProofUpload}
                      className="hidden"
                      disabled={uploading || actionLoading}
                    />
                  </label>
                  
                  {proofPhotos.map((url, idx) => (
                    <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border">
                      <img src={url} alt={`proof-${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Resolution summary note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 bg-white"
                  disabled={actionLoading}
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading || uploading || proofPhotos.length === 0}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 text-white font-black rounded-xl text-[11px] sm:text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 btn-transition shadow-xs whitespace-nowrap"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark Resolution Complete</span>
              </button>
            </form>
          )}

          {/* 4. VERIFY OR REOPEN ACTION (Raiser or Secretary) */}
          {issue.status === 'fixed' && (
            <div className="space-y-4">
              {/* Verify & Close (Raiser or Secretary) */}
              {(isRaiser || isSecretary) && (
                <div className="space-y-4">
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                    Verify if repairs were done to satisfaction to close this ticket permanently.
                  </p>

                  {/* Star Rating Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase text-zinc-400">Rate service quality</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="text-zinc-300 hover:text-amber-400 transition"
                        >
                          <Star 
                            className={`w-6 h-6 ${
                              star <= rating 
                                ? 'fill-amber-400 text-amber-400 animate-scale-up' 
                                : 'text-zinc-300'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Micro-Tipping Selection (Only if raiser is verification user) */}
                  {isRaiser && issue.assigned_to && (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-zinc-400">Send a cup of chai (Tip Worker) ☕</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { val: 0, label: 'No Tip' },
                          { val: 10, label: '₹10 ☕' },
                          { val: 20, label: '₹20 ☕☕' },
                          { val: 50, label: '₹50 🍪' }
                        ].map((tip) => (
                          <button
                            key={tip.val}
                            type="button"
                            onClick={() => setTipAmount(tip.val)}
                            className={`px-4 py-2.5 rounded-xl text-[10px] sm:text-xs md:text-sm font-black border btn-transition whitespace-nowrap cursor-pointer ${
                              tipAmount === tip.val
                                ? 'bg-indigo-600 border-indigo-700 text-white font-extrabold shadow-2xs'
                                : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                            }`}
                          >
                            {tip.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleVerifyClose}
                    disabled={actionLoading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 text-white font-black rounded-xl text-[11px] sm:text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 btn-transition shadow-xs whitespace-nowrap"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{tipAmount > 0 ? `Verify & Pay ₹${tipAmount}` : 'Verify & Close Ticket'}</span>
                  </button>
                </div>
              )}

              {/* Reopen / Dispute (Raiser only) */}
              {isRaiser && (
                <form onSubmit={handleReopen} className="border-t border-zinc-100 pt-4 space-y-3">
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                    If repair was incomplete or failed, describe why to dispute and reopen.
                  </p>
                  <input
                    type="text"
                    placeholder="Dispute reason..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 bg-white"
                    disabled={actionLoading}
                    required
                  />
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-zinc-300 text-white font-black rounded-xl text-[11px] sm:text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 btn-transition whitespace-nowrap"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Dispute & Reopen Issue</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Fallback info display */}
          {issue.status === 'assigned' && issue.assigned_to !== currentUser.id && (
            <p className="text-xs text-zinc-400 italic text-center font-medium">
              This issue has been claimed. Waiting for worker to start repairs.
            </p>
          )}

          {issue.status === 'fixing' && issue.assigned_to !== currentUser.id && (
            <p className="text-xs text-zinc-400 italic text-center font-medium">
              Repairs are currently in progress by the assigned worker.
            </p>
          )}
        </div>
      )}

      {/* Append-only Audit Trail Log Display */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-2xs space-y-4">
        <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-2 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-zinc-400" />
          <span>Append-Only Audit Trail</span>
        </h3>

        <div className="space-y-3.5 pl-3">
          {logs.map((log, idx) => {
            const actor = MockDb.users.find(u => u.id === log.actor_id);
            const membership = MockDb.getUserMembership(log.actor_id, societyId);

            const isLogRaiser = log.actor_id === issue.raised_by;
            const isLogMyIssue = issue.raised_by === currentUser.id;
            const isActorMe = log.actor_id === currentUser.id;
            const showActorIdentity = !issue.is_anonymous || !isLogRaiser || isLogMyIssue || isCommittee || isActorMe;

            const actorName = showActorIdentity ? (actor?.name || 'Unknown') : 'Anonymous Resident';
            const actorFlat = showActorIdentity ? (membership?.flat_number || 'Visitor') : 'Hidden Flat';

            return (
              <div key={log.id} className="relative pl-4 before:absolute before:left-0 before:top-1.5 before:bottom-0 before:w-0.5 before:bg-zinc-100">
                <div className="absolute left-[-2px] top-1.5 w-1.5 h-1.5 rounded-full bg-zinc-400" />
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-xs font-bold text-zinc-800">
                    {getActionName(log.action)}
                  </span>
                  <span className="text-[9px] text-zinc-400 font-bold uppercase">
                    {new Date(log.created_at).toLocaleDateString()} • {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                
                <div className="text-[10px] font-semibold text-zinc-400 mt-0.5">
                  Actor: <strong className="text-zinc-500">{actorName}</strong> ({actorFlat})
                </div>

                {log.note && (
                  <p className="text-[11px] font-medium text-zinc-500 italic mt-1 bg-zinc-50 rounded-lg p-2 border border-zinc-100/50">
                    "{log.note}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showUpiModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-xs p-6 flex flex-col items-center text-center shadow-xl animate-scale-up space-y-4">
            
            {/* Header branding */}
            <div className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[9px] font-black uppercase">
              <KeyRound className="w-3 h-3" />
              <span>AwasSahaay UPI Sandbox</span>
            </div>

            {!upiSuccess ? (
              <>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-zinc-800">Community Gratitude Tip</h4>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Paying maintenance staff</p>
                </div>

                {/* Amount visual */}
                <div className="text-3xl font-black text-zinc-900 tracking-tight py-2 border-y border-zinc-50 w-full">
                  ₹{tipAmount}.00
                </div>

                {/* Worker Avatar & details */}
                {issue.assigned_to && (
                  <div className="flex items-center gap-2 bg-zinc-50 p-2.5 rounded-xl w-full border border-zinc-100">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {MockDb.users.find(u => u.id === issue.assigned_to)?.name.charAt(0) || 'W'}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider leading-none">Receiver</div>
                      <div className="text-xs font-bold text-zinc-800 truncate leading-tight mt-0.5">
                        {MockDb.users.find(u => u.id === issue.assigned_to)?.name || 'Maintenance Worker'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Simulated QR Code box */}
                <div className="w-28 h-28 border border-zinc-200 rounded-2xl flex flex-col items-center justify-center p-2 relative bg-zinc-50/50">
                  {upiPaying ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Authorizing</span>
                    </div>
                  ) : (
                    <>
                      {/* Fake QR blocks */}
                      <div className="grid grid-cols-3 gap-1 opacity-25">
                        {[...Array(9)].map((_, i) => (
                          <div key={i} className="w-6 h-6 bg-zinc-900 rounded-xs" />
                        ))}
                      </div>
                      <span className="absolute text-[8px] font-black uppercase text-zinc-500 bg-white border px-1.5 py-0.5 rounded-md tracking-wider">
                        UPI Sandbox
                      </span>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full pt-2">
                  <button
                    onClick={() => setShowUpiModal(false)}
                    disabled={upiPaying}
                    className="flex-1 py-2.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-500 text-[10px] font-bold uppercase tracking-wider rounded-xl transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpiPay}
                    disabled={upiPaying}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>Pay ₹{tipAmount}</span>
                  </button>
                </div>
              </>
            ) : (
              /* Success screen state */
              <div className="py-6 flex flex-col items-center gap-3 animate-scale-up">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-50 animate-bounce">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-emerald-700">Payment Successful!</h4>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Chai sent to maintenance hero</p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
