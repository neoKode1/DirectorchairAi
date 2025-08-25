import { Progress } from "@/components/ui/progress";
import { X } from "lucide-react";
import { button as Button } from "@/components/ui/button";

interface UploadProgressProps {
  isCompressing: boolean;
  isUploading: boolean;
  compressionProgress: number;
  uploadProgress: number;
  onClose?: () => void;
}

export function UploadProgress({
  isCompressing,
  isUploading,
  compressionProgress,
  uploadProgress,
  onClose,
}: UploadProgressProps) {
  if (!isCompressing && !isUploading) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-background border rounded-lg shadow-lg p-4 z-50 animate-in slide-in-from-right">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">File Upload Progress</h3>
        {onClose && (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {isCompressing && (
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Compressing</span>
            <span className="text-muted-foreground">{compressionProgress}%</span>
          </div>
          <Progress value={compressionProgress} className="h-2" />
        </div>
      )}
      
      {isUploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Uploading</span>
            <span className="text-muted-foreground">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
    </div>
  );
} 