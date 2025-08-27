'use client';

import React, { useState } from 'react';
import FrameContainer from '@/components/frame-container';

export default function TestFramesPage() {
  const [primaryImage, setPrimaryImage] = useState<FileList | null>(null);
  const [styleImage, setStyleImage] = useState<FileList | null>(null);

  const handlePrimaryImageUpload = (files: FileList | null) => {
    console.log('Primary image uploaded:', files?.length || 0, 'files');
    setPrimaryImage(files);
  };

  const handleStyleImageUpload = (files: FileList | null) => {
    console.log('Style image uploaded:', files?.length || 0, 'files');
    setStyleImage(files);
  };

  const handlePrimaryImageRemove = () => {
    console.log('Primary image removed');
    setPrimaryImage(null);
    setStyleImage(null); // Also remove style image when primary is removed
  };

  const handleStyleImageRemove = () => {
    console.log('Style image removed');
    setStyleImage(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Frame System Test</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Frame Container Test</h2>
          
          <div className="relative h-32 bg-gray-700 rounded-lg p-4">
            <FrameContainer
              onPrimaryImageUpload={handlePrimaryImageUpload}
              onStyleImageUpload={handleStyleImageUpload}
              onPrimaryImageRemove={handlePrimaryImageRemove}
              onStyleImageRemove={handleStyleImageRemove}
              primaryImage={primaryImage}
              styleImage={styleImage}
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Debug Info</h2>
          <div className="text-white space-y-2">
            <p>Primary Image: {primaryImage ? `${primaryImage.length} file(s)` : 'None'}</p>
            <p>Style Image: {styleImage ? `${styleImage.length} file(s)` : 'None'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
