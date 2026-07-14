'use client';

import React, { useState } from 'react';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="text-xs text-zinc-400 font-medium py-2 bg-zinc-50 border border-dashed border-zinc-200 rounded-lg text-center">
        No images uploaded
      </div>
    );
  }

  const openLightbox = (idx: number) => {
    setActiveIdx(idx);
  };

  const closeLightbox = () => {
    setActiveIdx(null);
  };

  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIdx !== null && activeIdx > 0) {
      setActiveIdx(activeIdx - 1);
    }
  };

  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIdx !== null && activeIdx < images.length - 1) {
      setActiveIdx(activeIdx + 1);
    }
  };

  return (
    <div className="w-full">
      {/* Thumbnail grid */}
      <div className="flex flex-wrap gap-2">
        {images.map((url, idx) => (
          <div
            key={idx}
            onClick={() => openLightbox(idx)}
            className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-200 cursor-pointer hover:opacity-90 btn-transition shadow-2xs group"
          >
            <img
              src={url}
              alt={`upload-${idx}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center btn-transition">
              <ZoomIn className="w-4 h-4 text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal overlay */}
      {activeIdx !== null && (
        <div 
          onClick={closeLightbox}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in"
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition z-50"
            title="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation controls */}
          {activeIdx > 0 && (
            <button
              onClick={showPrev}
              className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition z-50 btn-transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {activeIdx < images.length - 1 && (
            <button
              onClick={showNext}
              className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition z-50 btn-transition"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Large image container */}
          <div className="max-w-full max-h-[80vh] flex flex-col items-center justify-center select-none relative">
            <img
              src={images[activeIdx]}
              alt={`full-${activeIdx}`}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl animate-scale-up"
              onClick={(e) => e.stopPropagation()} // block auto-close when clicking the image
            />
            {/* Image counter indicator */}
            <div className="mt-4 text-xs font-bold text-zinc-400 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full">
              {activeIdx + 1} of {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
