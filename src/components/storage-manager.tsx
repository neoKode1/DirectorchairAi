"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { button as Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Upload, 
  Trash2, 
  Database, 
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { contentStorage, type ContentStorageStats } from '@/lib/content-storage';
import { useToast } from '@/hooks/use-toast';

interface StorageManagerProps {
  className?: string;
  onStatsUpdate?: (stats: ContentStorageStats) => void;
}

export const StorageManager: React.FC<StorageManagerProps> = ({
  className = "",
  onStatsUpdate
}) => {
  const [stats, setStats] = useState<ContentStorageStats | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const { toast } = useToast();

  // Load stats
  const loadStats = () => {
    const currentStats = contentStorage.getStorageStats();
    setStats(currentStats);
    onStatsUpdate?.(currentStats);
  };

  // Export content
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportData = contentStorage.exportContent();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `directorchair-content-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Your content has been exported successfully.",
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Import content
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsImporting(true);
      try {
        const text = await file.text();
        const success = contentStorage.importContent(text);
        
        if (success) {
          loadStats(); // Refresh stats
          toast({
            title: "Import Successful",
            description: "Content has been imported successfully.",
          });
        } else {
          throw new Error('Import failed');
        }
      } catch (error) {
        console.error('Import failed:', error);
        toast({
          title: "Import Failed",
          description: "Failed to import content. Please check the file format.",
          variant: "destructive",
        });
      } finally {
        setIsImporting(false);
      }
    };
    input.click();
  };

  // Clear all content
  const handleClearAll = () => {
    contentStorage.clearAllContent();
    loadStats();
    setShowConfirmClear(false);
    toast({
      title: "Storage Cleared",
      description: "All content has been removed from local storage.",
    });
  };

  // Load stats on mount
  React.useEffect(() => {
    loadStats();
  }, []);

  if (!stats) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Card>
    );
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStoragePercentage = () => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    return (stats.totalSize / maxSize) * 100;
  };

  const storagePercentage = getStoragePercentage();
  const isStorageFull = storagePercentage > 90;

  return (
    <Card className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold">Local Storage</h3>
        </div>
        <Badge variant="outline" className="text-sm">
          {stats.totalItems} items
        </Badge>
      </div>

      {/* Storage Usage */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Storage Usage</span>
          <span className="font-medium">{formatBytes(stats.totalSize)} / 50 MB</span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              isStorageFull ? 'bg-red-500' : 'bg-primary'
            }`}
            style={{ width: `${Math.min(storagePercentage, 100)}%` }}
          />
        </div>
        
        {isStorageFull && (
          <div className="flex items-center gap-2 text-sm text-red-500">
            <AlertTriangle className="w-4 h-4" />
            <span>Storage is nearly full. Consider exporting and clearing old content.</span>
          </div>
        )}
      </div>

      {/* Content Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <ImageIcon className="w-5 h-5 text-blue-500" />
          <div>
            <div className="font-medium">{stats.byType.image}</div>
            <div className="text-xs text-muted-foreground">Images</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Video className="w-5 h-5 text-purple-500" />
          <div>
            <div className="font-medium">{stats.byType.video}</div>
            <div className="text-xs text-muted-foreground">Videos</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Music className="w-5 h-5 text-green-500" />
          <div>
            <div className="font-medium">{stats.byType.audio}</div>
            <div className="text-xs text-muted-foreground">Audio</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <FileText className="w-5 h-5 text-orange-500" />
          <div>
            <div className="font-medium">{stats.byType.text}</div>
            <div className="text-xs text-muted-foreground">Text</div>
          </div>
        </div>
      </div>

      {/* Date Range */}
      {stats.oldestItem && stats.newestItem && (
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            <span>
              Content from {stats.oldestItem.toLocaleDateString()} to {stats.newestItem.toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting || stats.totalItems === 0}
            className="w-full"
          >
            {isExporting ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export
          </Button>
          
          <Button
            variant="outline"
            onClick={handleImport}
            disabled={isImporting}
            className="w-full"
          >
            {isImporting ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Import
          </Button>
        </div>
        
        <Button
          variant="destructive"
          onClick={() => setShowConfirmClear(true)}
          disabled={stats.totalItems === 0}
          className="w-full"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All Content
        </Button>
      </div>

      {/* Confirm Clear Dialog */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="p-6 max-w-md mx-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h4 className="text-lg font-semibold">Clear All Content?</h4>
              </div>
              
              <p className="text-sm text-muted-foreground">
                This will permanently delete all {stats.totalItems} items from local storage. 
                This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmClear(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleClearAll}
                  className="flex-1"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
};
