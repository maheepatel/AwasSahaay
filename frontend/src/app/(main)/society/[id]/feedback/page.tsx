'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MessageSquare, Send, Check } from 'lucide-react';
import { MockDb, User } from '@/lib/mockDb';

interface FeedbackItem {
  id: string;
  posted_by: string;
  category: string;
  comment: string;
  created_at: string;
  reacts?: string[];
}

const DEFAULT_FEEDBACK: FeedbackItem[] = [
  {
    id: "fb-1",
    posted_by: "usr-resident1",
    category: "Cleaning",
    comment: "Staircase cleaning is not done regularly on the weekends. Dirt accumulates quickly near Block B stairwell.",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "fb-2",
    posted_by: "usr-tenant1",
    category: "Management",
    comment: "The visitor parking entry system is very slow. Sometimes security guards ask repetitive questions which delays entry. Can we digitize this?",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const societyId = params?.id as string;

  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Form States
  const [category, setCategory] = useState('Utility');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const loadData = () => {
    const activeUser = MockDb.getActiveUser();
    if (!activeUser) {
      router.push('/login');
      return;
    }
    setCurrentUser(activeUser);

    // Load from local storage or default
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`db_feedback_${societyId}`);
      if (stored) {
        setFeedbackList(JSON.parse(stored));
      } else {
        localStorage.setItem(`db_feedback_${societyId}`, JSON.stringify(DEFAULT_FEEDBACK));
        setFeedbackList(DEFAULT_FEEDBACK);
      }
    }
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [societyId, router]);

  if (!mounted || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    setTimeout(() => {
      const newItem: FeedbackItem = {
        id: 'fb-' + Math.random().toString(36).substr(2, 9),
        posted_by: currentUser.id,
        category,
        comment,
        created_at: new Date().toISOString()
      };

      const updated = [newItem, ...feedbackList];
      setFeedbackList(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`db_feedback_${societyId}`, JSON.stringify(updated));
      }

      setComment('');
      setSubmitting(false);
    }, 800);
  };

  const handleToggleReact = (feedbackId: string) => {
    MockDb.toggleFeedbackReact(societyId, feedbackId, currentUser.id);
    loadData();
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header bar */}
      <div className="flex items-center gap-2 bg-white border border-zinc-100 rounded-2xl p-4 shadow-2xs">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider">Member Feedback</h3>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Help improve society amenities</p>
        </div>
      </div>

      {/* Post Feedback form */}
      <form onSubmit={handleSubmit} className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-2xs space-y-4">
        <h4 className="text-xs font-extrabold text-zinc-500 uppercase tracking-widest border-b border-zinc-50 pb-2">
          Submit Feedback
        </h4>

        {/* Category picker */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold uppercase text-zinc-400">Category Tag</label>
          <div className="flex flex-wrap gap-1.5">
            {['Utility', 'Cleaning', 'Safety', 'Management', 'Others'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setCategory(tag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border btn-transition ${
                  category === tag
                    ? 'bg-indigo-600 border-indigo-700 text-white font-extrabold shadow-2xs'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Suggestion text box */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold uppercase text-zinc-400">Suggestion or Feedback</label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Type your suggestion for the committee..."
            className="w-full p-3 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            disabled={submitting}
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 btn-transition shadow-md shadow-indigo-100"
        >
          <span>Submit Suggestion</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Feedback Feed (Responsive Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {feedbackList.map((item) => {
          const poster = MockDb.users.find(u => u.id === item.posted_by);
          const membership = MockDb.getUserMembership(item.posted_by, societyId);

          return (
            <div key={item.id} className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-2xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-zinc-50 border-zinc-200 text-zinc-600 uppercase tracking-wide">
                  {item.category}
                </span>
                <span className="text-[9px] text-zinc-400 font-bold uppercase">
                  {new Date(item.created_at).toLocaleDateString([], {month:'short', day:'numeric'})}
                </span>
              </div>

              <p className="text-xs font-semibold text-zinc-700 leading-relaxed break-words">
                "{item.comment}"
              </p>

              <div className="text-[10px] text-zinc-400 font-bold border-t border-zinc-50 pt-2.5 flex justify-between items-center mt-1">
                <div>
                  <span>By {poster?.name || 'Resident'}</span>
                  <span> ({membership?.flat_number || 'Visitor'})</span>
                </div>
                
                <button
                  onClick={() => handleToggleReact(item.id)}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border font-extrabold text-[9px] uppercase tracking-wider btn-transition ${
                    item.reacts?.includes(currentUser.id)
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                  }`}
                >
                  <span>👍 +{(item.reacts || []).length}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
