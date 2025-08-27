'use client';

import React, { useState, useCallback } from 'react';
import FrameCard from './frame-card';

interface FrameData {
  files: FileList | null;
  previewUrl: string | null;
}

interface FrameContainerProps {
  onPrimaryImageUpload: (files: FileList | null) => void;
  onStyleImageUpload: (files: FileList | null) => void;
  onPrimaryImageRemove: () => void;
  onStyleImageRemove: () => void;
  primaryImage?: FileList | null;
  styleImage?: FileList | null;
}

const FrameContainer: React.FC<FrameContainerProps> = ({
  onPrimaryImageUpload,
  onStyleImageUpload,
  onPrimaryImageRemove,
  onStyleImageRemove,
  primaryImage,
  styleImage
}) => {
  const [frames, setFrames] = useState<{
    primary: FrameData;
    style: FrameData;
  }>({
    primary: { files: null, previewUrl: null },
    style: { files: null, previewUrl: null }
  });

  const handlePrimaryImageUpload = useCallback((files: FileList | null) => {
    const previewUrl = files && files.length > 0 ? URL.createObjectURL(files[0]) : null;
    setFrames(prev => ({
      ...prev,
      primary: { files, previewUrl }
    }));
    onPrimaryImageUpload(files);
  }, [onPrimaryImageUpload]);

  const handleStyleImageUpload = useCallback((files: FileList | null) => {
    const previewUrl = files && files.length > 0 ? URL.createObjectURL(files[0]) : null;
    setFrames(prev => ({
      ...prev,
      style: { files, previewUrl }
    }));
    onStyleImageUpload(files);
  }, [onStyleImageUpload]);

  const handlePrimaryImageRemove = useCallback(() => {
    if (frames.primary.previewUrl) {
      URL.revokeObjectURL(frames.primary.previewUrl);
    }
    setFrames(prev => ({
      ...prev,
      primary: { files: null, previewUrl: null }
    }));
    onPrimaryImageRemove();
  }, [frames.primary.previewUrl, onPrimaryImageRemove]);

  const handleStyleImageRemove = useCallback(() => {
    if (frames.style.previewUrl) {
      URL.revokeObjectURL(frames.style.previewUrl);
    }
    setFrames(prev => ({
      ...prev,
      style: { files: null, previewUrl: null }
    }));
    onStyleImageRemove();
  }, [frames.style.previewUrl, onStyleImageRemove]);

  // Show style slot only if primary image is uploaded
  const showStyleSlot = frames.primary.files !== null;

  return (
    <div className="absolute left-[25px] top-[-50px] h-[100px]" style={{ width: showStyleSlot ? '179px' : '100px' }}>
      <ul className="relative">
        {/* Primary Image Slot */}
        <li 
          className="relative reference-asset-item-0" 
          draggable={false} 
          tabIndex={0} 
          style={{ 
            position: 'absolute', 
            top: '0px', 
            left: '0px', 
            zIndex: 'unset', 
            transform: 'rotate(-3deg)', 
            userSelect: 'none', 
            touchAction: 'pan-y', 
            opacity: 1, 
            cursor: 'auto' 
          }}
        >
          <div className="h-[100px] flex-hcc">
            <FrameCard
              id="primary"
              label="PRIMARY IMAGE"
              onImageUpload={handlePrimaryImageUpload}
              onRemove={handlePrimaryImageRemove}
              isOptional={false}
            />
          </div>
        </li>

        {/* Style Reference Slot - Only show if primary image is uploaded */}
        {showStyleSlot && (
          <li 
            className="relative reference-asset-item-1" 
            draggable={false} 
            tabIndex={0} 
            style={{ 
              position: 'absolute', 
              top: '0px', 
              left: '100px', 
              zIndex: 1, 
              transform: 'translateX(-0.0765345px) rotate(3deg)', 
              userSelect: 'none', 
              touchAction: 'pan-y', 
              opacity: 1 
            }}
          >
            <div className="h-[100px] flex-hcc">
              <FrameCard
                id="style"
                label="STYLE REFERENCE"
                onImageUpload={handleStyleImageUpload}
                onRemove={handleStyleImageRemove}
                isOptional={true}
              />
            </div>
          </li>
        )}
      </ul>
    </div>
  );
};

export default FrameContainer;
