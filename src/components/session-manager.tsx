"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { button as Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  FolderOpen, 
  Edit, 
  Trash2, 
  Tag,
  Calendar,
  Clock,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  MoreHorizontal,
  Star,
  StarOff
} from 'lucide-react';
import { sessionStorage, type ChatSession, type SessionStats } from '@/lib/session-storage';
import { useToast } from '@/hooks/use-toast';

interface SessionManagerProps {
  className?: string;
  onSessionChange?: (sessionId: string) => void;
  onSessionCreate?: (session: ChatSession) => void;
}

export const SessionManager: React.FC<SessionManagerProps> = ({
  className = "",
  onSessionChange,
  onSessionCreate
}) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSession, setEditingSession] = useState<ChatSession | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const { toast } = useToast();

  // Form state for creating/editing sessions
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    theme: '',
    tags: ''
  });

  // Load sessions and stats
  const loadSessions = () => {
    const allSessions = sessionStorage.getAllSessions();
    const sessionStats = sessionStorage.getSessionStats();
    setSessions(allSessions);
    setStats(sessionStats);
  };

  // Filter sessions based on search query
  const filteredSessions = sessions.filter(session => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      session.name.toLowerCase().includes(query) ||
      session.description?.toLowerCase().includes(query) ||
      session.theme?.toLowerCase().includes(query) ||
      session.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });

  // Create new session
  const handleCreateSession = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Session Name Required",
        description: "Please enter a name for your session.",
        variant: "destructive",
      });
      return;
    }

    const tags = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const newSession = sessionStorage.createSession(
      formData.name.trim(),
      formData.description.trim() || undefined,
      formData.theme.trim() || undefined,
      tags
    );

    // Reset form
    setFormData({ name: '', description: '', theme: '', tags: '' });
    setShowCreateForm(false);
    loadSessions();

    onSessionCreate?.(newSession);
    onSessionChange?.(newSession.id);

    toast({
      title: "Session Created",
      description: `"${newSession.name}" session has been created.`,
    });
  };

  // Switch to session
  const handleSwitchSession = (sessionId: string) => {
    sessionStorage.setActiveSession(sessionId);
    loadSessions();
    onSessionChange?.(sessionId);
    
    const session = sessions.find(s => s.id === sessionId);
    toast({
      title: "Session Switched",
      description: `Switched to "${session?.name}" session.`,
    });
  };

  // Edit session
  const handleEditSession = (session: ChatSession) => {
    setEditingSession(session);
    setFormData({
      name: session.name,
      description: session.description || '',
      theme: session.theme || '',
      tags: session.tags?.join(', ') || ''
    });
  };

  // Save edited session
  const handleSaveEdit = () => {
    if (!editingSession || !formData.name.trim()) return;

    const tags = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const success = sessionStorage.updateSession(editingSession.id, {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      theme: formData.theme.trim() || undefined,
      tags
    });

    if (success) {
      setEditingSession(null);
      setFormData({ name: '', description: '', theme: '', tags: '' });
      loadSessions();

      toast({
        title: "Session Updated",
        description: `"${formData.name}" session has been updated.`,
      });
    }
  };

  // Delete session
  const handleDeleteSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    const success = sessionStorage.deleteSession(sessionId);
    
    if (success) {
      loadSessions();
      setShowConfirmDelete(null);

      toast({
        title: "Session Deleted",
        description: `"${session?.name}" session and all its content have been deleted.`,
      });
    }
  };

  // Get content type icon
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-3 h-3" />;
      case 'video': return <Video className="w-3 h-3" />;
      case 'audio': return <Music className="w-3 h-3" />;
      case 'text': return <FileText className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  return (
    <Card className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderOpen className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold">Chat Sessions</h3>
        </div>
        <div className="flex items-center gap-2">
          {stats && (
            <Badge variant="outline" className="text-sm">
              {stats.totalSessions} sessions
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateForm(true)}
            className="text-xs"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Session
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search sessions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Create Session Form */}
      {showCreateForm && (
        <Card className="p-4 space-y-4 border-dashed">
          <h4 className="font-medium">Create New Session</h4>
          <div className="space-y-3">
            <Input
              placeholder="Session name *"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
            <Textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
            <Input
              placeholder="Theme (optional)"
              value={formData.theme}
              onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
            />
            <Input
              placeholder="Tags (comma-separated)"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreateSession} size="sm">
              Create Session
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setShowCreateForm(false);
                setFormData({ name: '', description: '', theme: '', tags: '' });
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Edit Session Form */}
      {editingSession && (
        <Card className="p-4 space-y-4 border-dashed">
          <h4 className="font-medium">Edit Session</h4>
          <div className="space-y-3">
            <Input
              placeholder="Session name *"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
            <Textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
            <Input
              placeholder="Theme (optional)"
              value={formData.theme}
              onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
            />
            <Input
              placeholder="Tags (comma-separated)"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveEdit} size="sm">
              Save Changes
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setEditingSession(null);
                setFormData({ name: '', description: '', theme: '', tags: '' });
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Sessions List */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? (
              <div>
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No sessions found matching "{searchQuery}"</p>
              </div>
            ) : (
              <div>
                <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No sessions yet</p>
                <p className="text-sm">Create your first session to get started</p>
              </div>
            )}
          </div>
        ) : (
          filteredSessions.map((session) => (
            <Card
              key={session.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                session.isActive 
                  ? 'border-primary bg-primary/5' 
                  : 'hover:border-muted-foreground/30'
              }`}
              onClick={() => handleSwitchSession(session.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium truncate">{session.name}</h4>
                    {session.isActive && (
                      <Badge variant="default" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                  
                  {session.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {session.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(session.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {session.contentCount} items
                    </div>
                    {session.theme && (
                      <Badge variant="outline" className="text-xs">
                        {session.theme}
                      </Badge>
                    )}
                  </div>
                  
                  {session.tags && session.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Tag className="w-3 h-3 text-muted-foreground" />
                      <div className="flex gap-1 flex-wrap">
                        {session.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {session.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{session.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSession(session);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowConfirmDelete(session.id);
                    }}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Confirm Delete Dialog */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="p-6 max-w-md mx-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Trash2 className="w-6 h-6 text-red-500" />
                <h4 className="text-lg font-semibold">Delete Session?</h4>
              </div>
              
              <p className="text-sm text-muted-foreground">
                This will permanently delete the session and all its content. 
                This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDelete(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteSession(showConfirmDelete)}
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
};
