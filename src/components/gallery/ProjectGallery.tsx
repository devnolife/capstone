'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Spinner } from '@heroui/react';
import { X, ZoomIn, User, FolderGit2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

interface FeaturedScreenshot {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  fileUrl: string;
  mimeType: string;
  uploadedAt: string;
  project: {
    id: string;
    title: string;
    mahasiswa: {
      name: string;
    };
  };
}

interface ProjectGalleryProps {
  limit?: number;
}

export function ProjectGallery({ limit = 12 }: ProjectGalleryProps) {
  const [screenshots, setScreenshots] = useState<FeaturedScreenshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchFeaturedScreenshots = async () => {
      try {
        const response = await fetch(`/api/screenshots/featured?limit=${limit}`);
        if (!response.ok) {
          throw new Error('Failed to fetch screenshots');
        }
        const data = await response.json();
        setScreenshots(data.screenshots || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading gallery');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedScreenshots();
  }, [limit]);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
    document.body.style.overflow = '';
  };

  const goToPrevious = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === 0 ? screenshots.length - 1 : selectedIndex - 1);
  };

  const goToNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === screenshots.length - 1 ? 0 : selectedIndex + 1);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || screenshots.length === 0) {
    return null; // Don't show the section if there are no screenshots
  }

  const selectedScreenshot = selectedIndex !== null ? screenshots[selectedIndex] : null;

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {screenshots.map((screenshot, index) => (
          <motion.div
            key={screenshot.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            whileHover={{ y: -4 }}
            className="group relative cursor-pointer"
            onClick={() => openLightbox(index)}
          >
            <div className="relative aspect-video rounded-lg sm:rounded-xl overflow-hidden border border-default-200 bg-default-100 shadow-sm hover:shadow-xl transition-all duration-300">
              {/* Image */}
              <img
                src={screenshot.fileUrl}
                alt={screenshot.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Zoom Icon */}
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <ZoomIn size={14} className="sm:w-4 sm:h-4 text-white" />
                  </div>
                </div>
                
                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <h4 className="text-white font-semibold text-xs sm:text-sm truncate mb-1">
                    {screenshot.title}
                  </h4>
                  <div className="flex items-center gap-2 text-white/70 text-[10px] sm:text-xs">
                    <FolderGit2 size={10} className="sm:w-3 sm:h-3" />
                    <span className="truncate">{screenshot.project.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-[10px] sm:text-xs mt-1">
                    <User size={10} className="sm:w-3 sm:h-3" />
                    <span>{screenshot.project.mahasiswa.name}</span>
                  </div>
                </div>
              </div>

              {/* Category Badge */}
              {screenshot.category && (
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                  <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-white/90 dark:bg-black/70 text-[10px] sm:text-xs font-medium text-default-700 dark:text-white backdrop-blur-sm">
                    {screenshot.category}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedScreenshot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-2 sm:p-4"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              onClick={closeLightbox}
            >
              <X size={20} className="sm:w-6 sm:h-6 text-white" />
            </button>

            {/* Navigation Arrows */}
            {screenshots.length > 1 && (
              <>
                <button
                  className="absolute left-1 sm:left-4 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                >
                  <ChevronLeft size={24} className="sm:w-7 sm:h-7 text-white" />
                </button>
                <button
                  className="absolute right-1 sm:right-4 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  onClick={(e) => { e.stopPropagation(); goToNext(); }}
                >
                  <ChevronRight size={24} className="sm:w-7 sm:h-7 text-white" />
                </button>
              </>
            )}

            {/* Image Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative max-w-[95vw] sm:max-w-[90vw] max-h-[85vh] mx-2 sm:mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedScreenshot.fileUrl}
                alt={selectedScreenshot.title}
                className="max-w-full max-h-[65vh] sm:max-h-[75vh] object-contain rounded-lg shadow-2xl"
              />
              
              {/* Info Panel */}
              <div className="mt-3 sm:mt-4 text-center px-2">
                <h3 className="text-white text-base sm:text-xl font-bold mb-1 sm:mb-2">
                  {selectedScreenshot.title}
                </h3>
                {selectedScreenshot.description && (
                  <p className="text-white/70 text-xs sm:text-sm mb-2 sm:mb-3 max-w-lg mx-auto line-clamp-2">
                    {selectedScreenshot.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-white/60 text-xs sm:text-sm">
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <FolderGit2 size={12} className="sm:w-3.5 sm:h-3.5" />
                    <span className="truncate max-w-[120px] sm:max-w-none">{selectedScreenshot.project.title}</span>
                  </span>
                  <span className="text-white/30 hidden sm:inline">|</span>
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <User size={12} className="sm:w-3.5 sm:h-3.5" />
                    {selectedScreenshot.project.mahasiswa.name}
                  </span>
                </div>
                
                {/* Counter */}
                <div className="mt-3 sm:mt-4 text-white/40 text-[10px] sm:text-xs">
                  {(selectedIndex ?? 0) + 1} / {screenshots.length}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
