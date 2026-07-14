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
    <div className="w-full bg-white border-b border-zinc-100 transition-all duration-300">
      {/* Top Banner strip (collapsed view) */}
      {!isExpanded ? (
        <div 
          onClick={() => setIsExpanded(true)}
          className={`flex items-center justify-between px-4 py-2.5 cursor-pointer text-xs font-medium border-b ${getSeverityStyles(topAlert.severity).bg}`}
        >
          <div className="flex items-center gap-2 truncate">
            {getSeverityStyles(topAlert.severity).icon}
            <span className="truncate pr-4">{topAlert.message}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 text-[10px] font-bold uppercase tracking-wider opacity-90">
            {sortedAlerts.length > 1 && (
              <span className="px-1.5 py-0.5 bg-black/5 rounded-sm">+{sortedAlerts.length - 1} more</span>
            )}
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>
      ) : (
        /* Expanded list view */
        <div className="p-4 bg-zinc-50 max-h-72 overflow-y-auto space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-200">
            <h4 className="text-xs font-extrabold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              Pinned Community Alerts ({sortedAlerts.length})
            </h4>
            <button 
              onClick={() => setIsExpanded(false)}
              className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200 rounded-full btn-transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {sortedAlerts.map((alert) => {
              const styles = getSeverityStyles(alert.severity);
              const poster = MockDb.users.find(u => u.id === alert.posted_by);
              const posterMembership = MockDb.getUserMembership(alert.posted_by, societyId);

              return (
                <div 
                  key={alert.id}
                  className={`p-3 rounded-xl border flex flex-col gap-2.5 transition-all ${styles.bg}`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex gap-2">
                      <div className="mt-0.5 flex-shrink-0">{styles.icon}</div>
                      <p className="text-xs font-semibold leading-relaxed text-zinc-950">
                        {alert.message}
                      </p>
                    </div>
                    {isUserAllowedToResolve(alert) && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="flex-shrink-0 flex items-center gap-1 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 px-2 py-1 rounded-md text-[10px] font-bold shadow-2xs btn-transition"
                        title="Mark alert resolved and clear pin"
                      >
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span>Resolve</span>
                      </button>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold border-t border-black/5 pt-2">
                    <span className="flex items-center gap-1">
                      <span>Posted by {poster?.name || 'Unknown'}</span>
                      <span>({posterMembership?.flat_number || 'N/A'})</span>
                    </span>
                    <span>
                      {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setIsExpanded(false)}
            className="w-full text-center text-xs text-indigo-600 font-bold hover:underline flex items-center justify-center gap-1 pt-1.5"
          >
            <span>Collapse Alerts</span>
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
