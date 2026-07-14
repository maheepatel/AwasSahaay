'use client';

import React from 'react';
import { Check, ClipboardList, UserCheck, Wrench, Image, ShieldCheck, HelpCircle } from 'lucide-react';
import { Issue, MockDb } from '@/lib/mockDb';
import ImageGallery from './ImageGallery';

interface IssueStatusStepperProps {
  issue: Issue;
}

export default function IssueStatusStepper({ issue }: IssueStatusStepperProps) {
  const steps = [
    { key: 'raised', label: 'Raised', icon: <ClipboardList className="w-4 h-4" /> },
    { key: 'assigned', label: 'Assigned', icon: <UserCheck className="w-4 h-4" /> },
    { key: 'fixing', label: 'Fixing', icon: <Wrench className="w-4 h-4" /> },
    { key: 'fixed', label: 'Fixed', icon: <Image className="w-4 h-4" /> },
    { key: 'verified', label: 'Verified & Closed', icon: <ShieldCheck className="w-4 h-4" /> }
  ];

  // Helper to determine the state status for display:
  // 'completed' (past steps) | 'active' (current step) | 'pending' (future steps)
  const getStepState = (stepKey: string): 'completed' | 'active' | 'pending' => {
    const statusOrder = ['raised', 'assigned', 'fixing', 'fixed', 'verified'];
    const currentIdx = statusOrder.indexOf(issue.status);
    const stepIdx = statusOrder.indexOf(stepKey);

    if (stepIdx < currentIdx || issue.status === 'verified') {
      return 'completed';
    }
    if (stepIdx === currentIdx) {
      return 'active';
    }
    return 'pending';
  };

  const getStepTimestamp = (stepKey: string) => {
    switch (stepKey) {
      case 'raised': return issue.raised_at;
      case 'assigned': return issue.assigned_at;
      case 'fixing': 
        // For local mock, we assume fixing starts slightly after assigned
        return issue.assigned_at ? new Date(new Date(issue.assigned_at).getTime() + 15 * 60 * 1000).toISOString() : undefined;
      case 'fixed': return issue.fixed_at;
      case 'verified': return issue.verified_at;
      default: return undefined;
    }
  };

  const formatTimestamp = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' • ' + 
           date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
      {steps.map((step) => {
        const state = getStepState(step.key);
        const timestamp = getStepTimestamp(step.key);
        
        let circleStyles = '';
        let iconColor = '';
        let labelStyles = '';

        if (state === 'completed') {
          circleStyles = 'bg-emerald-600 border-emerald-600 scale-100 text-white';
          iconColor = 'text-white';
          labelStyles = 'text-zinc-900 font-bold';
        } else if (state === 'active') {
          circleStyles = 'bg-indigo-600 border-indigo-600 text-white animate-status-pulse scale-110';
          iconColor = 'text-white';
          labelStyles = 'text-indigo-600 font-black';
        } else {
          circleStyles = 'bg-white border-zinc-200 text-zinc-400';
          iconColor = 'text-zinc-400';
          labelStyles = 'text-zinc-400 font-semibold';
        }

        // Fetch associated data inline for detail blocks
        const assignee = step.key === 'assigned' && issue.assigned_to 
          ? MockDb.users.find(u => u.id === issue.assigned_to) 
          : null;
        
        const verifier = step.key === 'verified' && issue.verified_by 
          ? MockDb.users.find(u => u.id === issue.verified_by) 
          : null;

        return (
          <div key={step.key} className="relative flex gap-4 items-start group">
            {/* Step Icon Indicator */}
            <div className={`absolute -left-[31px] w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 ${circleStyles}`}>
              {state === 'completed' ? (
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              ) : (
                step.icon
              )}
            </div>

            {/* Step Description / Meta */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline gap-2">
                <h4 className={`text-xs uppercase tracking-wider ${labelStyles}`}>
                  {step.label}
                </h4>
                {timestamp && (
                  <span className="text-[10px] text-zinc-400 font-bold flex-shrink-0">
                    {formatTimestamp(timestamp)}
                  </span>
                )}
              </div>

              {/* Step Sub-details (Dynamic blocks inside stepper) */}
              <div className="mt-1.5 text-xs text-zinc-600 font-medium">
                {step.key === 'raised' && (
                  <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-3 space-y-2 mt-1">
                    <p className="italic text-zinc-700">"{issue.description}"</p>
                    {issue.media_urls.length > 0 && (
                      <div className="pt-1.5 border-t border-zinc-200/50">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Attached Media</div>
                        <ImageGallery images={issue.media_urls} />
                      </div>
                    )}
                  </div>
                )}

                {step.key === 'assigned' && state !== 'pending' && (
                  <div className="mt-1 font-semibold flex items-center gap-2 text-zinc-700">
                    {assignee ? (
                      <>
                        <span>Assigned to committee member:</span>
                        <span className="text-zinc-950 font-bold">{assignee.name}</span>
                      </>
                    ) : (
                      <span className="text-amber-600">Pending Assignment by Committee</span>
                    )}
                  </div>
                )}

                {step.key === 'fixing' && state !== 'pending' && (
                  <div className="mt-1 text-zinc-500 font-semibold italic">
                    {state === 'completed' ? 'Fixing completed' : 'Work is currently in progress...'}
                  </div>
                )}

                {step.key === 'fixed' && state !== 'pending' && (
                  <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-3 mt-1 space-y-2">
                    <span className="font-bold text-zinc-700">Fixer's Proof of Resolution:</span>
                    {issue.proof_media_urls.length > 0 ? (
                      <div className="mt-1">
                        <ImageGallery images={issue.proof_media_urls} />
                      </div>
                    ) : (
                      <p className="text-zinc-400 italic text-[11px] mt-0.5">No resolution photo uploaded</p>
                    )}
                  </div>
                )}

                {step.key === 'verified' && state === 'completed' && verifier && (
                  <div className="mt-1 font-semibold text-zinc-700">
                    Verified and closed by: <strong className="text-zinc-900">{verifier.name}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
