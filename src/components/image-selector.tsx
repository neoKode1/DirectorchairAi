'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface ImageSelection {
  x: number;
  y: number;
  width: number;
  height: number;
  imageUrl: string;
  croppedDataUrl: string;
}

interface ImageSelectorProps {
  imageUrl: string;
  onSelectionComplete: (selection: ImageSelection) => void;
  className?: string;
  children: React.ReactNode;
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({
  imageUrl,
  onSelectionComplete,
  className,
  children
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find the image element within children
  const findImageElement = useCallback(() => {
    if (containerRef.current) {
      return containerRef.current.querySelector('img') as HTMLImageElement;
    }
    return null;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const imageElement = findImageElement();
    if (!containerRef.current || !imageElement) return;

    const rect = containerRef.current.getBoundingClientRect();
    const imageRect = imageElement.getBoundingClientRect();
    
    // Calculate relative position within the image
    const x = e.clientX - imageRect.left;
    const y = e.clientY - imageRect.top;

    // Check if click is within image bounds
    if (x >= 0 && x <= imageRect.width && y >= 0 && y <= imageRect.height) {
      setIsSelecting(true);
      setIsDragging(true);
      setSelection({
        startX: x,
        startY: y,
        endX: x,
        endY: y
      });
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const imageElement = findImageElement();
    if (!imageElement) return;

    const imageRect = imageElement.getBoundingClientRect();
    const x = e.clientX - imageRect.left;
    const y = e.clientY - imageRect.top;

    // Constrain to image bounds
    const constrainedX = Math.max(0, Math.min(x, imageRect.width));
    const constrainedY = Math.max(0, Math.min(y, imageRect.height));

    // Only update if we're currently selecting
    setSelection(prev => {
      if (!prev) return null;
      return {
        ...prev,
        endX: constrainedX,
        endY: constrainedY
      };
    });
  }, [findImageElement]);

  const handleMouseUp = useCallback(async (e?: React.MouseEvent) => {
    const imageElement = findImageElement();
    if (!isSelecting || !selection || !imageElement) return;

    // If this is a mouse event, update the final position
    if (e) {
      const imageRect = imageElement.getBoundingClientRect();
      const x = e.clientX - imageRect.left;
      const y = e.clientY - imageRect.top;
      
      const constrainedX = Math.max(0, Math.min(x, imageRect.width));
      const constrainedY = Math.max(0, Math.min(y, imageRect.height));
      
      setSelection(prev => prev ? {
        ...prev,
        endX: constrainedX,
        endY: constrainedY
      } : null);
    }

    // Small delay to ensure state is updated
    setTimeout(async () => {
      setIsSelecting(false);
      setIsDragging(false);

      // Get the final selection state
      const finalSelection = selection;
      if (!finalSelection) return;

      // Calculate selection bounds
      const startX = Math.min(finalSelection.startX, finalSelection.endX);
      const startY = Math.min(finalSelection.startY, finalSelection.endY);
      const width = Math.abs(finalSelection.endX - finalSelection.startX);
      const height = Math.abs(finalSelection.endY - finalSelection.startY);

      // Only proceed if selection is large enough
      if (width < 20 || height < 20) {
        setSelection(null);
        return;
      }

      try {
        // Create cropped image
        const croppedDataUrl = await cropImage(imageUrl, startX, startY, width, height);
        
        const imageSelection: ImageSelection = {
          x: startX,
          y: startY,
          width,
          height,
          imageUrl,
          croppedDataUrl
        };

        onSelectionComplete(imageSelection);
        setSelection(null);
      } catch (error) {
        console.error('Error cropping image:', error);
        setSelection(null);
      }
    }, 10);
  }, [isSelecting, selection, imageUrl, onSelectionComplete, findImageElement]);

  // Handle escape key to cancel selection and global mouse events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSelecting) {
        setIsSelecting(false);
        setIsDragging(false);
        setSelection(null);
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isSelecting) {
        const imageElement = findImageElement();
        if (!imageElement) return;

        const imageRect = imageElement.getBoundingClientRect();
        const x = e.clientX - imageRect.left;
        const y = e.clientY - imageRect.top;

        // Constrain to image bounds
        const constrainedX = Math.max(0, Math.min(x, imageRect.width));
        const constrainedY = Math.max(0, Math.min(y, imageRect.height));

        setSelection(prev => {
          if (!prev) return null;
          return {
            ...prev,
            endX: constrainedX,
            endY: constrainedY
          };
        });
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (isSelecting) {
        handleMouseUp();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isSelecting, handleMouseUp, findImageElement]);

  // Calculate selection rectangle for display
  const getSelectionStyle = () => {
    const imageElement = findImageElement();
    if (!selection || !imageElement) return {};

    const startX = Math.min(selection.startX, selection.endX);
    const startY = Math.min(selection.startY, selection.endY);
    const width = Math.abs(selection.endX - selection.startX);
    const height = Math.abs(selection.endY - selection.startY);

    return {
      left: startX,
      top: startY,
      width,
      height
    };
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onMouseDown={handleMouseDown}
    >
      {children}
      
      {/* Selection overlay */}
      {isSelecting && selection && (
        <div
          className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none z-10"
          style={getSelectionStyle()}
        />
      )}
      
      {/* Instructions overlay */}
      {!isSelecting && (
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-200 pointer-events-none z-5">
          <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs p-2 rounded opacity-0 hover:opacity-100 transition-opacity duration-200">
            Click and drag to select an area for AI analysis
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to crop image using canvas
const cropImage = async (
  imageUrl: string,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set canvas size to selection size
      canvas.width = width;
      canvas.height = height;

      // Calculate scale factors
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;

      // Draw cropped portion
      ctx.drawImage(
        img,
        x * scaleX,
        y * scaleY,
        width * scaleX,
        height * scaleY,
        0,
        0,
        width,
        height
      );

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png', 0.9);
      resolve(dataUrl);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
};
