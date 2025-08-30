import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import { button as Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface MultiImageUploadProps {
  uploadedImages: (File | string)[];
  imagePreviews: string[];
  onImageUpload: (file: File) => void;
  onImageRemove: (index: number) => void;
  onClearAll: () => void;
  maxImages?: number;
}

export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  uploadedImages,
  imagePreviews,
  onImageUpload,
  onImageRemove,
  onClearAll,
  maxImages = 5
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const remainingSlots = maxImages - uploadedImages.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      
      if (filesToProcess.length < files.length) {
        toast({
          title: "Upload Limit Reached",
          description: `You can upload up to ${maxImages} images. Only the first ${remainingSlots} files will be processed.`,
          variant: "destructive",
        });
      }
      
      filesToProcess.forEach(file => {
        onImageUpload(file);
      });
    }
  }, [onImageUpload, uploadedImages.length, maxImages, toast]);

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
    if (files) {
      const remainingSlots = maxImages - uploadedImages.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      
      if (filesToProcess.length < files.length) {
        toast({
          title: "Upload Limit Reached",
          description: `You can upload up to ${maxImages} images. Only the first ${remainingSlots} files will be processed.`,
          variant: "destructive",
        });
      }
      
      filesToProcess.forEach(file => {
        if (file.type.startsWith('image/')) {
          onImageUpload(file);
        }
      });
    }
  }, [onImageUpload, uploadedImages.length, maxImages, toast]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/30'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary/10">
              <Upload className="w-6 h-6 text-primary" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Upload Images for Multi-Image Editing</h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop multiple images here or click to browse. 
              <br />
              <span className="font-medium text-primary">
                Perfect for Gemini 2.5 Flash multi-image editing!
              </span>
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ImageIcon className="w-3 h-3" />
            <span>Supports up to {maxImages} images</span>
            <span>•</span>
            <span>JPG, PNG, WebP</span>
          </div>
          
          <Button
            onClick={handleUploadClick}
            variant="outline"
            className="mt-4"
            disabled={uploadedImages.length >= maxImages}
          >
            <Plus className="w-4 h-4 mr-2" />
            {uploadedImages.length === 0 ? 'Upload Images' : 'Add More Images'}
          </Button>
        </div>
      </div>

      {/* Image Previews */}
      {uploadedImages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              Uploaded Images ({uploadedImages.length}/{maxImages})
            </h4>
            {uploadedImages.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-destructive hover:text-destructive"
              >
                <X className="w-3 h-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                  <img
                    src={preview}
                    alt={`Uploaded image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Remove button */}
                <button
                  onClick={() => onImageRemove(index)}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive/90"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
                
                {/* Image number badge */}
                <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/50 text-white text-xs font-medium">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
          
          {/* Multi-image editing info */}
          {uploadedImages.length > 1 && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-2">
                <ImageIcon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-primary">Multi-Image Editing Ready!</p>
                  <p className="text-muted-foreground">
                    You have {uploadedImages.length} images uploaded. Gemini 2.5 Flash will blend these images together 
                    based on your prompt for advanced multi-image editing.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
