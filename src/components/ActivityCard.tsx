import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, MapPin, Award, ArrowRight, X } from 'lucide-react';
import { Activity } from '../lib/firebase';

interface ActivityCardProps {
  activity: Activity;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Combine and deduplicate images to form the slideshow list
  const images = React.useMemo(() => {
    const list: string[] = [];
    if (activity.imageUrl) {
      list.push(activity.imageUrl);
    }
    if (activity.imageUrls && Array.isArray(activity.imageUrls)) {
      activity.imageUrls.forEach(url => {
        if (url && !list.includes(url)) {
          list.push(url);
        }
      });
    }
    if (list.length === 0) {
      list.push("https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80");
    }
    return list;
  }, [activity.imageUrl, activity.imageUrls]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto change image index one by one every 4 seconds
  React.useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images]);

  return (
    <>
      {/* Activity Card Grid Item */}
      <motion.div
        layoutId={`card-container-${activity.id}`}
        whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
        className="relative h-[360px] bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
      >
        {/* Full-size Card Image with Auto-Changing Slideshow */}
        <div className="absolute inset-0 w-full h-full bg-gray-100 overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.img
              key={`card-img-${images[currentImageIndex]}`}
              src={images[currentImageIndex]}
              alt={activity.title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>
          {/* Elegant Dark Gradient Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 transition-opacity duration-300 z-10 pointer-events-none" />
        </div>

        {/* Carousel Indicators at the top-right of the card */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 z-20 flex gap-1.5 bg-black/40 px-2.5 py-1.5 rounded-full backdrop-blur-sm">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(idx);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'
                }`}
                title={`View image ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Content Overlaid Within the Image */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 z-10 text-white">
          <div className="space-y-3">
            {/* Date & Location Indicator */}
            <div className="flex items-center gap-3 text-xs font-mono text-gray-300">
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                <Calendar className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                {activity.date}
              </span>
              {activity.location && (
                <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm truncate max-w-[150px]">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  {activity.location}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-sans text-xl font-bold tracking-tight text-white leading-tight drop-shadow-sm group-hover:text-rose-300 transition-colors">
              {activity.title}
            </h3>

            {/* Brief snippet of writings */}
            {activity.description && (
              <p className="font-sans text-xs text-gray-300 leading-relaxed line-clamp-2 opacity-85">
                {activity.description}
              </p>
            )}

            {/* Details Option/Button within the Image */}
            <div className="pt-2 flex items-center justify-between">
              <button
                id={`btn-details-${activity.id}`}
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-sans text-xs font-bold rounded-xl shadow-lg cursor-pointer transition-all z-20"
              >
                <span>Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {activity.goalReached && (
                <span className="text-[10px] font-mono bg-pink-500/20 text-rose-300 px-2.5 py-1 rounded-lg border border-pink-500/30 backdrop-blur-sm font-semibold uppercase tracking-wider">
                  {activity.goalReached}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Read More Detail Overlay / Dialog */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl my-8 border border-gray-100"
            >
              {/* Close Button */}
              <button
                id={`btn-close-modal-${activity.id}`}
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 z-30 flex items-center justify-center w-10 h-10 bg-black/50 hover:bg-black/75 text-white rounded-full transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Large Image Header with Carousel */}
              <div className="relative h-80 w-full bg-gray-100 overflow-hidden">
                <AnimatePresence mode="popLayout">
                  <motion.img
                    key={`modal-img-${images[currentImageIndex]}`}
                    src={images[currentImageIndex]}
                    alt={activity.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />
                
                <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                  <h2 className="font-sans text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
                    {activity.title}
                  </h2>
                </div>

                {/* Carousel Indicators inside Modal Header */}
                {images.length > 1 && (
                  <div className="absolute top-4 left-4 z-25 flex gap-1.5 bg-black/40 px-2.5 py-1.5 rounded-full backdrop-blur-sm">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                          idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'
                        }`}
                        title={`View image ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Content Area */}
              <div className="p-6 md:p-8">
                {/* Event Metadata Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 mb-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-rose-50 text-rose-600 rounded-xl">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase text-gray-400 font-bold">Date Conducted</p>
                      <p className="font-sans text-sm font-semibold text-gray-800">{activity.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-rose-50 text-rose-600 rounded-xl">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase text-gray-400 font-bold">Location</p>
                      <p className="font-sans text-sm font-semibold text-gray-800">{activity.location}</p>
                    </div>
                  </div>

                  {activity.goalReached && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-pink-50 text-rose-600 rounded-xl">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase text-gray-400 font-bold">Impact Reached</p>
                        <p className="font-sans text-sm font-semibold text-gray-800">{activity.goalReached}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Extended Details */}
                <div className="space-y-4">
                  <h4 className="font-sans text-lg font-bold text-gray-900">Summary Outline</h4>
                  <p className="font-sans text-gray-700 leading-relaxed font-medium bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    {activity.description}
                  </p>
                  
                  {activity.details && (
                    <>
                      <h4 className="font-sans text-lg font-bold text-gray-900 pt-4">Detailed In-Depth Work</h4>
                      <p className="font-sans text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {activity.details}
                      </p>
                    </>
                  )}
                </div>

                {/* CTA inside Read More */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <p className="font-sans text-xs text-gray-500 font-medium">
                    This work is powered entirely by voluntary contributions and support.
                  </p>
                  <button
                    id={`btn-close-bottom-${activity.id}`}
                    onClick={() => setIsOpen(false)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-sans text-sm font-semibold rounded-xl cursor-pointer shadow-md shadow-pink-200 hover:shadow-none transition-all"
                  >
                    Back to Activities
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
