'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MessageSquare, Send, Sparkles, User as UserIcon } from 'lucide-react';
import { MockDb, User } from '@/lib/mockDb';

interface ChatMessage {
  id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

const DEFAULT_CHAT: ChatMessage[] = [
  {
    id: "ch-1",
    sender_id: "usr-secretary",
    text: "Welcome to the general chat everyone! Feel free to discuss daily updates here.",
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  },
  {
    id: "ch-2",
    sender_id: "usr-resident1",
    text: "Hi Rajesh, thanks for setting this up! Fast tracking the plumbing leak yesterday was a huge help.",
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  },
  {
    id: "ch-3",
    sender_id: "usr-treasurer",
    text: "Reminder: Clubhouse bookings for July weekends are now open. Please submit forms via office soon.",
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  }
];

export default function GeneralPage() {
  const params = useParams();
  const router = useRouter();
  const societyId = params?.id as string;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [inputText, setInputText] = useState('');
  const [mounted, setMounted] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    const activeUser = MockDb.getActiveUser();
    if (!activeUser) {
      router.push('/login');
      return;
    }
    setCurrentUser(activeUser);

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`db_chat_${societyId}`);
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        localStorage.setItem(`db_chat_${societyId}`, JSON.stringify(DEFAULT_CHAT));
        setMessages(DEFAULT_CHAT);
      }
    }
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [societyId, router]);

  // Scroll to bottom when messages load
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!mounted || !currentUser) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: 'ch-' + Math.random().toString(36).substr(2, 9),
      sender_id: currentUser.id,
      text: inputText,
      created_at: new Date().toISOString()
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`db_chat_${societyId}`, JSON.stringify(updated));
    }
    setInputText('');

    // Trigger a fun mock reply from another resident after a 1.5s delay to simulate live chat!
    setTimeout(() => {
      const mockSenders = ['usr-secretary', 'usr-treasurer', 'usr-tenant1'];
      const randomSender = mockSenders[Math.floor(Math.random() * mockSenders.length)];
      const senderObj = MockDb.users.find(u => u.id === randomSender);
      
      const replies = [
        "Acknowledge that. Thanks for the heads up!",
        "Yes, totally agree on this.",
        "Let's bring this up in the upcoming AGM meeting.",
        "Understood. We will check with the maintenance team.",
        "Thanks!"
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      const replyMsg: ChatMessage = {
        id: 'ch-' + Math.random().toString(36).substr(2, 9),
        sender_id: randomSender,
        text: `@${currentUser.name} ${randomReply}`,
        created_at: new Date().toISOString()
      };

      setMessages(prev => {
        const next = [...prev, replyMsg];
        if (typeof window !== 'undefined') {
          localStorage.setItem(`db_chat_${societyId}`, JSON.stringify(next));
        }
        return next;
      });
    }, 1800);
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-zinc-50">
      {/* Messages Scroll Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 no-scrollbar"
      >
        {messages.map((msg) => {
          const sender = MockDb.users.find(u => u.id === msg.sender_id);
          const membership = MockDb.getUserMembership(msg.sender_id, societyId);
          const isMe = msg.sender_id === currentUser.id;

          return (
            <div 
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Sender Avatar */}
              <div className="flex-shrink-0">
                {sender?.avatar_url ? (
                  <img 
                    src={sender.avatar_url} 
                    alt={sender.name} 
                    className="w-8 h-8 rounded-full object-cover border border-zinc-100"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {sender?.name.charAt(0) || 'U'}
                  </div>
                )}
              </div>

              {/* Message bubble */}
              <div className="space-y-0.5">
                <div className={`text-[9px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 ${isMe ? 'justify-end' : ''}`}>
                  <span>{sender?.name || 'Resident'}</span>
                  <span>({membership?.flat_number || 'Visitor'})</span>
                </div>
                <div className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed border break-words ${
                  isMe 
                    ? 'bg-indigo-600 border-indigo-700 text-white rounded-tr-xs' 
                    : 'bg-white border-zinc-100 text-zinc-800 rounded-tl-xs'
                }`}>
                  {msg.text}
                </div>
                <div className={`text-[8px] text-zinc-400 font-bold ${isMe ? 'text-right' : ''}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Input Bar */}
      <form 
        onSubmit={handleSendMessage}
        className="absolute bottom-0 inset-x-0 p-4 bg-white border-t border-zinc-100 flex gap-2.5 items-center z-10 shadow-md"
      >
        <input
          type="text"
          placeholder="Send a message in #general..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-zinc-50 focus:bg-white"
        />
        <button
          type="submit"
          className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition hover:scale-105 active:scale-95 shadow-sm"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
