'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Megaphone, ShieldAlert, Plus, Send } from 'lucide-react';
import { MockDb, Announcement, User } from '@/lib/mockDb';

export default function AnnouncementsPage() {
  const params = useParams();
  const router = useRouter();
  const societyId = params?.id as string;

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  
  // Form State
  const [showPostForm, setShowPostForm] = useState(false);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const loadData = () => {
    const activeUser = MockDb.getActiveUser();
    if (!activeUser) {
      router.push('/login');
      return;
    }
    setCurrentUser(activeUser);

    const mem = MockDb.getUserMembership(activeUser.id, societyId);
    if (mem) {
      setUserRole(mem.role);
    }

    // Get announcements sorted newest first
    const list = MockDb.announcements.filter(a => a.society_id === societyId).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setAnnouncements(list);
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [societyId, router]);

  if (!mounted || !currentUser) return null;

  const isCommittee = ['secretary', 'asst_secretary', 'treasurer'].includes(userRole);

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setTimeout(() => {
      const list = MockDb.announcements;
      const newAnn: Announcement = {
        id: 'ann-' + Math.random().toString(36).substr(2, 9),
        society_id: societyId,
        posted_by: currentUser.id,
        content,
        created_at: new Date().toISOString()
      };
      list.unshift(newAnn);
      MockDb.announcements = list;

      setContent('');
      setShowPostForm(false);
      loadData();
      setSubmitting(false);
    }, 800);
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header card */}
      <div className="flex justify-between items-center bg-white border border-zinc-100 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider">Committee Announcements</h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">One-way official broadcasts</p>
          </div>
        </div>
        {isCommittee && !showPostForm && (
          <button
            onClick={() => setShowPostForm(true)}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-xl btn-transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Broadcast</span>
          </button>
        )}
      </div>

      {/* Broadcast form for committee */}
      {showPostForm && (
        <form onSubmit={handlePostAnnouncement} className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-xs space-y-3.5 animate-slide-down">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
            <h4 className="text-xs font-extrabold text-zinc-500 uppercase tracking-widest">Post Official Broadcast</h4>
            <button
              type="button"
              onClick={() => setShowPostForm(false)}
              className="text-xs font-bold text-zinc-400 hover:text-zinc-600"
            >
              Cancel
            </button>
          </div>

          <div>
            <textarea
              rows={3}
              placeholder="Write the official notice/announcement here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
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
            <span>Publish Broadcast</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {/* Feed list (Responsive Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {announcements.length > 0 ? (
          announcements.map((ann) => {
            const poster = MockDb.users.find(u => u.id === ann.posted_by);
            const membership = MockDb.getUserMembership(ann.posted_by, societyId);

            return (
              <div key={ann.id} className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-2xs space-y-3.5 relative overflow-hidden">
                {/* Visual accent left line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />
                
                <p className="text-xs font-medium leading-relaxed text-zinc-800 whitespace-pre-line break-words">
                  {ann.content}
                </p>

                <div className="flex justify-between items-center border-t border-zinc-50 pt-3 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                  <span className="flex items-center gap-1">
                    <span>By {poster?.name || 'Committee'}</span>
                    <span className="text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-1.5 py-0.5 rounded-sm lowercase text-[8px]">
                      {membership?.role || 'Committee'}
                    </span>
                  </span>
                  <span>
                    {new Date(ann.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-zinc-200 p-6">
            <ShieldAlert className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500 font-medium text-sm">No announcements posted</p>
            <p className="text-zinc-400 text-xs mt-1">
              Only committee members can post official notices in this channel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
