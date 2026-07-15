'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Mic, MicOff, Camera, Image as ImageIcon, Trash2, ArrowLeft, Send, Sparkles } from 'lucide-react';
import { MockDb, User } from '@/lib/mockDb';

export default function RaiseIssuePage() {
  const params = useParams();
  const router = useRouter();
  const societyId = params?.id as string;

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [flatNumber, setFlatNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<'water' | 'electrical' | 'security' | 'plumbing' | 'civil' | 'other'>('water');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]); // holds base64 data URLs for mock uploads
  const [uploading, setUploading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
    const activeUser = MockDb.getActiveUser();
    if (!activeUser) {
      router.push('/login');
      return;
    }
    setCurrentUser(activeUser);

    const mem = MockDb.getUserMembership(activeUser.id, societyId);
    if (mem) {
      setFlatNumber(mem.flat_number);
      setPhone(activeUser.phone);
    }
  }, [societyId, router]);

  // Initializing Web Speech API Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-IN'; // Indian-accented English, handles Hinglish reasonably well

        rec.onstart = () => {
          setIsListening(true);
          setSpeechError('');
        };

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setDescription(prev => prev ? `${prev} ${transcript}` : transcript);
          }
        };

        rec.onerror = (event: any) => {
          console.error('Speech error', event);
          setSpeechError('Could not recognize speech. Try speaking closer to the mic.');
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  if (!mounted || !currentUser) return null;

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type the description manually.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Handle local mock image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setUploading(true);

    const files = Array.from(e.target.files);
    
    // Process images and convert to base64 for local mockup persistence
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
      setImages(prev => [...prev, ...base64Images]);
      setUploading(false);
    });
  };

  const removeImage = (idxToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please describe the issue.');
      return;
    }

    setSubmitting(true);

    // Setup default SLA hours based on category
    let slaHours = 120; // default for other/civil
    if (category === 'security') slaHours = 24;
    else if (category === 'water' || category === 'electrical') slaHours = 48;
    else if (category === 'plumbing') slaHours = 72;

    setTimeout(() => {
      MockDb.addIssue({
        society_id: societyId,
        raised_by: currentUser.id,
        category,
        description,
        media_urls: images,
        sla_hours: slaHours,
        is_anonymous: isAnonymous
      });

      setSubmitting(false);
      router.push(`/society/${societyId}/issues`);
    }, 1000);
  };

  return (
    <div className="p-5 pb-24">
      {/* Back Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push(`/society/${societyId}/issues`)}
          className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-xl btn-transition border border-zinc-200 bg-white"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>
        <div>
          <h2 className="text-base font-extrabold text-zinc-900">
            Raise New Complaint
          </h2>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
            Fill in the details below
          </p>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Auto-filled details (ReadOnly display) */}
        <div className="bg-zinc-100/70 border border-zinc-200/50 rounded-xl p-3 flex justify-between text-xs font-semibold text-zinc-500">
          <div>
            Name: <span className="text-zinc-800 font-bold">{currentUser.name}</span>
          </div>
          <div>
            Flat: <span className="text-zinc-800 font-bold">{flatNumber}</span>
          </div>
        </div>

        {/* Category chip selectors */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold uppercase text-zinc-400 tracking-wider">
            Issue Category
          </label>
          <div className="flex flex-wrap gap-2">
            {(['water', 'electrical', 'security', 'plumbing', 'civil', 'other'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-[10px] sm:text-xs md:text-sm font-black border capitalize btn-transition whitespace-nowrap ${
                  category === cat
                    ? 'bg-indigo-600 border-indigo-700 text-white shadow-sm font-extrabold'
                    : 'bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Description textarea + speech-to-text mic trigger */}
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <label className="block text-xs font-extrabold uppercase text-zinc-400 tracking-wider">
              Describe the Problem
            </label>
            {recognitionRef.current && (
              <span className="text-[10px] text-indigo-500 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Supports voice input</span>
              </span>
            )}
          </div>

          <div className="relative">
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Corridor corridor lights in Block B are flickering..."
              className="w-full p-4 pr-12 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold text-zinc-700 bg-white"
              disabled={submitting}
              required
            />
            {/* Mic trigger button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`absolute right-3.5 bottom-4 p-2.5 rounded-full transition-all duration-300 ${
                isListening 
                  ? 'bg-rose-500 text-white animate-critical-pulse shadow-md shadow-rose-100' 
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800'
              }`}
              title={isListening ? 'Stop Listening' : 'Dictate Description'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {isListening && (
            <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest animate-pulse flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span>Listening... speak now. Tap mic to stop.</span>
            </div>
          )}

          {speechError && (
            <div className="text-[10px] font-semibold text-amber-600">
              {speechError}
            </div>
          )}
        </div>

        {/* Media uploads */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold uppercase text-zinc-400 tracking-wider">
            Upload Photos
          </label>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Native camera-first upload triggers */}
            <label className="w-16 h-16 border-2 border-dashed border-zinc-200 hover:border-indigo-400 rounded-xl flex flex-col items-center justify-center cursor-pointer btn-transition bg-white">
              <Camera className="w-5 h-5 text-zinc-400" />
              <span className="text-[9px] font-bold text-zinc-400 uppercase mt-1">Photo</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handleImageChange}
                className="hidden"
                disabled={uploading || submitting}
              />
            </label>

            <label className="w-16 h-16 border-2 border-dashed border-zinc-200 hover:border-indigo-400 rounded-xl flex flex-col items-center justify-center cursor-pointer btn-transition bg-white">
              <ImageIcon className="w-5 h-5 text-zinc-400" />
              <span className="text-[9px] font-bold text-zinc-400 uppercase mt-1">Gallery</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                disabled={uploading || submitting}
              />
            </label>

            {/* Uploaded thumbnails list preview */}
            {images.map((url, idx) => (
              <div
                key={idx}
                className="relative w-16 h-16 rounded-xl overflow-hidden border border-zinc-200 group"
              >
                <img
                  src={url}
                  alt={`preview-${idx}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white btn-transition"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
            Supports multiple images. Hover/tap thumbnail to delete.
          </p>
        </div>

        {/* Anonymous option */}
        <div className="bg-white border border-zinc-200/50 rounded-xl p-4 flex items-start gap-3 shadow-2xs">
          <input
            id="anonymous-toggle"
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-4 h-4 text-indigo-600 border-zinc-300 rounded focus:ring-indigo-500 mt-0.5 cursor-pointer"
            disabled={submitting}
          />
          <div className="text-xs font-semibold">
            <label htmlFor="anonymous-toggle" className="block font-extrabold text-zinc-800 cursor-pointer">
              Raise this complaint anonymously
            </label>
            <p className="text-[10px] text-zinc-400 font-medium leading-relaxed mt-0.5">
              Your name and flat number will be hidden from other residents in the community feed. Only committee admins (Secretaries) will be able to see your identity for verification and work coordination.
            </p>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-black rounded-xl text-[11px] sm:text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 btn-transition shadow-sm mt-8 whitespace-nowrap"
          disabled={submitting || uploading}
        >
          {submitting ? 'Submitting Complaint...' : 'File Complaint'}
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
