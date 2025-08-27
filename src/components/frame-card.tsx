'use client';

import React, { useState, useRef, useCallback } from 'react';
import { X, Plus, Upload } from 'lucide-react';
import { button } from '@/components/ui/button';

interface FrameCardProps {
  id: string;
  label: string;
  onImageUpload: (files: FileList | null) => void;
  onRemove: () => void;
  isOptional?: boolean;
  className?: string;
}

const FrameCard: React.FC<FrameCardProps> = ({
  id,
  label,
  onImageUpload,
  onRemove,
  isOptional = false,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onImageUpload(files);
    }
  }, [onImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    onRemove();
  }, [onRemove]);

  return (
    <div
      className={`relative group/card overflow-hidden select-none transition-all duration-200 ${
        isDragOver ? 'scale-105' : ''
      } ${className}`}
      style={{
        boxShadow: 'rgba(0, 0, 0, 0.25) 0px 4px 12px 0px',
        borderRadius: '12px',
        height: '100px',
        width: '77px'
      }}
    >
      {/* Background with backdrop blur */}
      <div className="pointer-events-none bg-white/20 backdrop-blur-md transition-colors group-hover/card:bg-white/25 size-full" />
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id={`file-input-${id}`}
        multiple={false}
        accept="image/*,video/*"
        className="hidden"
        type="file"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* Clickable label */}
      <label
        htmlFor={`file-input-${id}`}
        className="cursor-pointer absolute inset-0"
        style={{ opacity: 1 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="grid grid-rows-[1fr_auto] p-[7px] rounded overflow-hidden h-full">
          {/* Preview image or placeholder */}
          {previewUrl ? (
            <div className="relative w-full h-full">
              <img
                src={previewUrl}
                alt={label}
                className="w-full h-full object-cover rounded"
              />
              <div className="absolute inset-0 bg-black/20 group-hover/card:bg-black/10 transition-colors" />
            </div>
          ) : (
            <div className="flex absolute left-[8px] top-[8px]">
              <div>
                <Plus className="w-[22px] h-[22px] text-white m-[2px]" />
              </div>
            </div>
          )}

          {/* Label text */}
          <div className="absolute inset-[8px] top-auto h-[40px] flex justify-start items-end text-[12px] font-medium text-left uppercase leading-tight tracking-tighter text-white/60">
            {label.split(' ').map((word, index) => (
              <React.Fragment key={index}>
                {word}
                {index < label.split(' ').length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </label>

      {/* Remove button */}
      {previewUrl && (
        <button
          className="transition-opacity absolute flex-hcc p-1 group cursor-pointer"
          style={{ top: '0px', right: '0px' }}
          onClick={handleRemove}
          tabIndex={0}
        >
          <div className="absolute inset-0 rounded-full bg-black/40 backdrop-blur-md size-[18px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover/card:opacity-100 transition-opacity opacity-100" />
          <X className="relative w-[20px] h-[20px] p-[4px] text-white/80 rotate-45 group-hover/card:opacity-100 transition-opacity opacity-100" />
        </button>
      )}

      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center">
          <Upload className="w-8 h-8 text-white" />
        </div>
      )}
    </div>
  );
};

export default FrameCard;
