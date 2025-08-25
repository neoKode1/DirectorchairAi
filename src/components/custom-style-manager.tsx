"use client";

import React, { useState, useEffect } from 'react';
import { customStyleManager, type CustomStyle } from '@/lib/custom-styles';

interface CustomStyleManagerProps {
  onStyleSelect?: (style: CustomStyle) => void;
  selectedStyleId?: string;
}

export function CustomStyleManager({ onStyleSelect, selectedStyleId }: CustomStyleManagerProps) {
  const [styles, setStyles] = useState<CustomStyle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  useEffect(() => {
    loadStyles();
  }, []);

  const loadStyles = () => {
    const availableStyles = customStyleManager.getAvailableStyles();
    setStyles(availableStyles);
  };

  const handleStyleSelect = (style: CustomStyle) => {
    onStyleSelect?.(style);
  };

  const handleStyleDelete = (styleId: string) => {
    if (confirm('Are you sure you want to delete this custom style?')) {
      customStyleManager.removeStyle(styleId);
      loadStyles();
    }
  };

  const filteredStyles = styles.filter(style => {
    const matchesSearch = style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         style.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         style.trigger_word.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = selectedTag === 'all' || style.tags?.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(styles.flatMap(style => style.tags || [])));

  if (styles.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium">No Custom Styles</h3>
        <p className="mt-2">You haven't trained any custom styles yet.</p>
        <p className="text-sm">Train a custom style using the FLUX Krea trainer to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search styles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Tags</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {/* Style Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStyles.map((style) => (
          <div
            key={style.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedStyleId === style.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleStyleSelect(style)}
          >
            {/* Style Header */}
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900 truncate">{style.name}</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStyleDelete(style.id);
                }}
                className="text-red-500 hover:text-red-700 text-sm"
                title="Delete style"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Trigger Word */}
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-500">Trigger Word:</span>
              <code className="ml-1 text-xs bg-gray-100 px-2 py-1 rounded text-blue-600">
                {style.trigger_word}
              </code>
            </div>

            {/* Description */}
            {style.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {style.description}
              </p>
            )}

            {/* Tags */}
            {style.tags && style.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {style.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Created Date */}
            <div className="text-xs text-gray-400">
              Created: {style.created_at.toLocaleDateString()}
            </div>

            {/* Usage Instructions */}
            <div className="mt-2 text-xs text-gray-500">
              Use <code className="bg-gray-100 px-1 rounded">{style.trigger_word}</code> in your prompt
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredStyles.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No styles match your search criteria.</p>
        </div>
      )}

      {/* Stats */}
      <div className="text-xs text-gray-400 text-center">
        Showing {filteredStyles.length} of {styles.length} styles
      </div>
    </div>
  );
}

// Component to display a single custom style
export function CustomStyleCard({ 
  style, 
  isSelected = false, 
  onSelect 
}: { 
  style: CustomStyle; 
  isSelected?: boolean; 
  onSelect?: (style: CustomStyle) => void;
}) {
  return (
    <div
      className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => onSelect?.(style)}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-sm text-gray-900 truncate">{style.name}</h4>
        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
          Ready
        </span>
      </div>
      
      <div className="mb-2">
        <span className="text-xs text-gray-500">Use:</span>
        <code className="ml-1 text-xs bg-gray-100 px-2 py-1 rounded text-blue-600">
          {style.trigger_word}
        </code>
      </div>
      
      {style.description && (
        <p className="text-xs text-gray-600 line-clamp-2">
          {style.description}
        </p>
      )}
    </div>
  );
}
