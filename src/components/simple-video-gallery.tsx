'use client';

import { useState, useEffect } from 'react';

const videos = [
  '/video1.mp4',
  '/video2.mp4', 
  '/video3.mp4',
  '/video4.mp4',
  '/video5.mp4'
];

export function SimpleVideoGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate videos every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full rounded-lg shadow-lg overflow-hidden bg-gray-900 text-white relative">
      <div className="relative aspect-video bg-black">
        {videos.map((src, index) => (
          <video
            key={index}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src={src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ))}
        
        {/* Video indicator dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-white scale-125' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
