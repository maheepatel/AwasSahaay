'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Megaphone, AlertCircle, AlertTriangle, Info, CheckCircle, Trash2, Camera, Send, Plus } from 'lucide-react';
import { MockDb, Alert, User } from '@/lib/mockDb';

export default function AlertsChannelPage() {
  const params = useParams();
  const router = useRouter();
  const societyId = params?.id as string;

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Post Alert Form States
  const [showPostForm, setShowPostForm] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'critical' | 'caution' | 'info'>('info');
  const [photo, setPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const loadData = () => {
    const activeUser = MockDb.getActiveUser();
    if (!activeUser) {
      router.push('/login');
      return;
    }
    setCurrentUser(activeUser);

    // Get all alerts for this society, sorted by created_at desc (newest first)
    const socAlerts = MockDb.alerts.filter(a => a.society_id === societyId).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setAlerts(socAlerts);
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [societyId, router]);

  if (!mounted || !currentUser) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handlePostAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      alert('Please enter an alert message.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      MockDb.addAlert({
        society_id: societyId,
        posted_by: currentUser.id,
        message,
        severity,
        photo_url: photo || undefined
      });

      setMessage('');
      setSeverity('info');
      setPhoto(null);
      setShowPostForm(false);
      loadData();
      setSubmitting(false);

      // Trigger standard window reload or router refresh so the pinned strip at top refreshes!
      router.refresh();
    }, 800);
  };

  const handleResolveAlert = (alertId: string) => {
    MockDb.resolveAlert(alertId, currentUser.id);
    loadData();
    router.refresh();
  };

  const handleToggleReact = (alertId: string) => {
    MockDb.toggleAlertReact(alertId, currentUser.id);
    loadData();
  };

  const getSeverityStyles = (sev: string) => {
    switch (sev) {
      case 'critical':
        return {
          bg: 'bg-rose-50 border-rose-100 text-rose-800',
          badge: 'bg-rose-100 border-rose-200 text-rose-700',
          icon: <AlertCircle className="w-4.5 h-4.5 text-rose-600 animate-critical-pulse" />
        };
      case 'caution':
        return {
          bg: 'bg-amber-50 border-amber-100 text-amber-800',
          badge: 'bg-amber-100 border-amber-200 text-amber-700',
          icon: <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
        };
      default:
        return {
          bg: 'bg-zinc-50 border-zinc-100 text-zinc-800',
          badge: 'bg-zinc-100 border-zinc-200 text-zinc-600',
          icon: <Info className="w-4.5 h-4.5 text-zinc-500" />
        };
    }
  };

  const isUserAllowedToResolve = (alert: Alert) => {
    if (alert.posted_by === currentUser.id) return true;
    const mem = MockDb.getUserMembership(currentUser.id, societyId);
    return ['secretary', 'asst_secretary', 'treasurer'].includes(mem?.role || '');
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header bar and Add button */}
      <div className="flex justify-between items-center bg-white border border-zinc-100 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider">Community Broadcasts</h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Alert Feed & Archives</p>
          </div>
        </div>
        {!showPostForm && (
          <button
            onClick={() => setShowPostForm(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10.5px] sm:text-xs md:text-sm font-black px-4 py-2.5 rounded-xl btn-transition shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Post Alert</span>
          </button>
        )}
      </div>

      {/* Post Alert Form Expansion */}
      {showPostForm && (
        <form onSubmit={handlePostAlert} className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-xs space-y-4 animate-slide-down">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
            <h4 className="text-xs font-extrabold text-zinc-500 uppercase tracking-widest">Post Community Alert</h4>
            <button
              type="button"
              onClick={() => setShowPostForm(false)}
              className="text-xs font-bold text-zinc-400 hover:text-zinc-600"
            >
              Cancel
            </button>
          </div>

          {/* Severity picker */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase text-zinc-400">Severity Level</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSeverity('info')}
                className={`flex-1 py-2.5 px-2 text-[10.5px] xs:text-xs font-black uppercase tracking-wider border rounded-xl btn-transition whitespace-nowrap ${
                  severity === 'info' ? 'bg-zinc-100 border-zinc-200 text-zinc-800' : 'bg-white text-zinc-400 border-zinc-200'
                }`}
              >
                ⚪ Info
              </button>
              <button
                type="button"
                onClick={() => setSeverity('caution')}
                className={`flex-1 py-2.5 px-2 text-[10.5px] xs:text-xs font-black uppercase tracking-wider border rounded-xl btn-transition whitespace-nowrap ${
                  severity === 'caution' ? 'bg-amber-100 border-amber-200 text-amber-700 shadow-2xs' : 'bg-white text-zinc-400 border-zinc-200'
                }`}
              >
                🟠 Caution
              </button>
              <button
                type="button"
                onClick={() => setSeverity('critical')}
                className={`flex-1 py-2.5 px-2 text-[10.5px] xs:text-xs font-black uppercase tracking-wider border rounded-xl btn-transition whitespace-nowrap ${
                  severity === 'critical' ? 'bg-rose-500 border-rose-600 text-white shadow-sm' : 'bg-white text-zinc-400 border-zinc-200'
                }`}
              >
                🔴 Critical
              </button>
            </div>
          </div>

          {/* Message input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase text-zinc-400">Alert Message</label>
            <input
              type="text"
              placeholder="e.g. Water tankers arriving delayed by 3 hours today..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2.5 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              maxLength={120}
              disabled={submitting}
              required
            />
            <div className="text-right text-[9px] text-zinc-400 font-bold">{message.length}/120 characters</div>
          </div>

          {/* Photo attach picker */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase text-zinc-400">Attach Reference Image (Optional)</label>
            <div className="flex items-center gap-3">
              <label className="w-12 h-12 border border-dashed border-zinc-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 bg-zinc-50 btn-transition">
                <Camera className="w-4 h-4 text-zinc-400" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={uploading || submitting}
                />
              </label>
              {photo && (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border">
                  <img src={photo} alt="alert-upload" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhoto(null)}
                    className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold transition-all"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || uploading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-[11px] sm:text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 btn-transition shadow-sm whitespace-nowrap"
          >
            <span>Broadcast Alert</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {/* Alerts Feed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {alerts.length > 0 ? (
          alerts.map((alert) => {
            const styles = getSeverityStyles(alert.severity);
            const poster = MockDb.users.find(u => u.id === alert.posted_by);
            const membership = MockDb.getUserMembership(alert.posted_by, societyId);

            return (
              <div
                key={alert.id}
                className={`bg-white border rounded-2xl p-4 flex flex-col gap-3 relative transition-all duration-300 ${
                  alert.status === 'resolved' 
                    ? 'border-zinc-200 opacity-60' 
                    : 'border-zinc-100 shadow-2xs'
                }`}
              >
                {/* Header tag and status */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {styles.icon}
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${styles.badge}`}>
                      {alert.severity}
                    </span>
                  </div>

                  <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                    alert.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100 font-bold' 
                      : 'bg-zinc-100 text-zinc-400 border-zinc-200'
                  }`}>
                    {alert.status}
                  </span>
                </div>

                {/* Content Message */}
                <div className="flex gap-4 items-start">
                  <div className="flex-1 space-y-2">
                    <p className={`text-xs font-semibold leading-relaxed break-words ${alert.status === 'resolved' ? 'line-through text-zinc-400' : 'text-zinc-800'}`}>
                      {alert.message}
                    </p>
                  </div>
                  {alert.photo_url && (
                    <img 
                      src={alert.photo_url} 
                      alt="alert-detail" 
                      className="w-14 h-14 rounded-lg object-cover border border-zinc-200"
                    />
                  )}
                </div>

                {/* Footer details & Action */}
                <div className="flex justify-between items-center border-t border-zinc-50 pt-3 text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">
                  <div>
                    <span>Posted by {poster?.name || 'Unknown'}</span>
                    <span> ({membership?.flat_number || 'Visitor'})</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {alert.status === 'active' && (
                      <button
                        onClick={() => handleToggleReact(alert.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border font-black text-[9px] sm:text-[10px] md:text-xs uppercase tracking-wider btn-transition whitespace-nowrap cursor-pointer ${
                          alert.reacts?.includes(currentUser.id)
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                        }`}
                      >
                        <span>👍 +{(alert.reacts || []).length}</span>
                      </button>
                    )}

                    {alert.status === 'active' && isUserAllowedToResolve(alert) && (
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-black text-[9.0px] sm:text-[10px] md:text-xs tracking-wider uppercase btn-transition bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-xl whitespace-nowrap cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>
                    )}
                    {alert.status === 'resolved' && (
                      <span className="text-zinc-400 italic">Resolved</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-zinc-200 p-6">
            <Megaphone className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500 font-medium text-sm">No broadcasts yet</p>
            <p className="text-zinc-400 text-xs mt-1">
              Important alerts and community broadcasts will be logged here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
