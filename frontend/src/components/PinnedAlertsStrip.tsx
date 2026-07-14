'use client';

import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, X, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { MockDb, Alert, User } from '@/lib/mockDb';

interface PinnedAlertsStripProps {
  societyId: string;
  currentUser: User;
  onAlertResolved?: () => void;
}

export default function PinnedAlertsStrip({ societyId, currentUser, onAlertResolved }: PinnedAlertsStripProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const allAlerts = MockDb.alerts.filter(a => a.society_id === societyId && a.status === 'active');

  // Sort: Critical (red) first, Caution (orange) second, Info (grey) third
  const sortedAlerts = [...allAlerts].sort((a, b) => {
    const severityWeight = { critical: 3, caution: 2, info: 1 };
    return severityWeight[b.severity] - severityWeight[a.severity];
  });

  if (sortedAlerts.length === 0) return null;

  const topAlert = sortedAlerts[0];

  const getSeverityStyles = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-rose-50 border-rose-100 text-rose-800',
          badge: 'bg-rose-500 text-white',
          icon: <AlertCircle className="w-4 h-4 animate-critical-pulse text-rose-600" />,
          dot: 'bg-rose-500'
        };
      case 'caution':
        return {
          bg: 'bg-amber-50 border-amber-100 text-amber-800',
          badge: 'bg-amber-500 text-amber-950',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
          dot: 'bg-amber-500'
        };
      default:
        return {
          bg: 'bg-zinc-50 border-zinc-100 text-zinc-800',
          badge: 'bg-zinc-500 text-white',
          icon: <Info className="w-4 h-4 text-zinc-500" />,
          dot: 'bg-zinc-400'
        };
    }
  };

  const handleResolve = (alertId: string) => {
    MockDb.resolveAlert(alertId, currentUser.id);
    if (onAlertResolved) onAlertResolved();
  };

  const isUserAllowedToResolve = (alert: Alert) => {
    if (alert.posted_by === currentUser.id) return true;
    const mem = MockDb.getUserMembership(currentUser.id, societyId);
    return ['secretary', 'asst_secretary', 'treasurer'].includes(mem?.role || '');
  };

  return (
    <div className={`w-full transition-all duration-300 ${
      isExpanded 
        ? 'bg-zinc-900 border-b border-zinc-800 shadow-md relative z-40' 
        : 'bg-zinc-950 border-b border-zinc-900 relative z-25'
    }`}>
      {/* CSS Keyframes Injection */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes alertMarquee {
          0% { transform: translate3d(100%, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); }
        }
        .ticker-marquee {
          display: inline-block;
          white-space: nowrap;
          animation: alertMarquee 40s linear infinite;
        }
        .ticker-container:hover .ticker-marquee {
          animation-play-state: paused;
        }
      `}} />

      {/* Top Banner strip (collapsed marquee marquee) */}
      {!isExpanded ? (
        <div 
          onClick={() => setIsExpanded(true)}
          className="flex items-center justify-between px-4 py-2 cursor-pointer text-[10px] font-bold text-zinc-300 ticker-container relative w-full h-8 overflow-hidden select-none bg-linear-to-r from-zinc-950 to-indigo-950/80"
        >
          {/* Static Title Badge */}
          <div className="flex items-center gap-1.5 bg-rose-600 border border-rose-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-sm tracking-wider flex-shrink-0 z-10 shadow-xs">
            <AlertCircle className="w-3 h-3 text-white" />
            <span>Pinned Alert Ticker</span>
          </div>

          {/* Marquee Text Scroller Container */}
          <div className="flex-1 overflow-hidden relative h-full flex items-center pl-4 pr-10">
            <div className="ticker-marquee text-zinc-300">
              {sortedAlerts.map((alert, idx) => (
                <span key={alert.id} className="mr-24 inline-flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    alert.severity === 'critical' ? 'bg-rose-500 animate-pulse' :
                    alert.severity === 'caution' ? 'bg-amber-500' : 'bg-zinc-400'
                  }`} />
                  <span>{alert.message}</span>
                  <span className="text-[8px] text-zinc-500 uppercase font-black">
                    (Posted by {MockDb.users.find(u => u.id === alert.posted_by)?.name || 'Admin'})
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Static Arrow helper */}
          <div className="flex items-center gap-1.5 flex-shrink-0 text-[8px] font-black uppercase tracking-wider text-indigo-400 pl-2 border-l border-zinc-800 bg-linear-to-l from-zinc-950 to-transparent pr-1 z-10">
            {sortedAlerts.length > 1 && (
              <span className="px-1 bg-zinc-850 rounded-xs">+{sortedAlerts.length - 1}</span>
            )}
            <ChevronDown className="w-3 h-3" />
          </div>
        </div>
      ) : (
        /* Expanded list view displaying as premium card list overlay */
        <div className="p-4 bg-zinc-900 border-t border-zinc-850 max-h-96 overflow-y-auto space-y-4 shadow-xl z-50 relative">
          <div className="flex justify-between items-center pb-2.5 border-b border-zinc-800">
            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>Active Society Alerts ({sortedAlerts.length})</span>
            </h4>
            <button 
              onClick={() => setIsExpanded(false)}
              className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-full btn-transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {sortedAlerts.map((alert) => {
              const styles = getSeverityStyles(alert.severity);
              const poster = MockDb.users.find(u => u.id === alert.posted_by);
              const posterMembership = MockDb.getUserMembership(alert.posted_by, societyId);

              return (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-2xl border flex flex-col gap-3 transition-all bg-zinc-950 ${
                    alert.severity === 'critical' ? 'border-rose-950/80 shadow-rose-950/10' :
                    alert.severity === 'caution' ? 'border-amber-950/80 shadow-amber-950/10' :
                    'border-zinc-800 shadow-zinc-950/10'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-2.5">
                      <div className="mt-0.5 flex-shrink-0">{styles.icon}</div>
                      <p className="text-xs font-semibold leading-relaxed text-zinc-200">
                        {alert.message}
                      </p>
                    </div>
                    {isUserAllowedToResolve(alert) && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="flex-shrink-0 flex items-center gap-1 bg-zinc-900 hover:bg-zinc-850 text-emerald-400 border border-zinc-800 px-2.5 py-1 rounded-xl text-[9px] font-bold shadow-2xs btn-transition hover:border-emerald-950"
                        title="Mark alert resolved and clear pin"
                      >
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                        <span>Resolve</span>
                      </button>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-[9px] text-zinc-500 font-bold border-t border-zinc-900 pt-2.5">
                    <span className="flex items-center gap-1">
                      <span>Posted by {poster?.name || 'Unknown'}</span>
                      <span>({posterMembership?.flat_number || 'N/A'})</span>
                    </span>
                    <span>
                      {new Date(alert.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setIsExpanded(false)}
            className="w-full text-center text-xs text-indigo-400 font-bold hover:underline flex items-center justify-center gap-1 pt-1.5"
          >
            <span>Close Dashboard Alerts</span>
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
