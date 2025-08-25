// Session-based Content Storage Manager
// Allows users to organize content by chat sessions and themes

export interface ChatSession {
  id: string;
  name: string;
  description?: string;
  theme?: string;
  createdAt: Date;
  lastActive: Date;
  contentCount: number;
  isActive: boolean;
  tags?: string[];
}

export interface SessionContent {
  id: string;
  sessionId: string;
  type: 'image' | 'video' | 'audio' | 'text';
  url: string;
  title: string;
  prompt?: string;
  timestamp: Date;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    format?: string;
    size?: number;
  };
  // For multiple images
  images?: string[];
  imageCount?: number;
  selectedImageIndex?: number;
  // Session metadata
  savedAt: Date;
  version: string;
}

export interface SessionStats {
  totalSessions: number;
  totalContent: number;
  activeSession?: string;
  sessionsByTheme: Record<string, number>;
  recentSessions: ChatSession[];
}

export class SessionStorageManager {
  private static instance: SessionStorageManager;
  private storageKey = 'narrative-session-storage';
  private sessionsKey = 'narrative-sessions';
  private version = '1.0.0';
  private maxStorageSize = 100 * 1024 * 1024; // 100MB limit
  private maxSessions = 50; // Maximum number of sessions
  private maxContentPerSession = 500; // Maximum content per session

  private constructor() {
    this.initializeStorage();
  }

  public static getInstance(): SessionStorageManager {
    if (!SessionStorageManager.instance) {
      SessionStorageManager.instance = new SessionStorageManager();
    }
    return SessionStorageManager.instance;
  }

  private initializeStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Initialize sessions storage
      const existingSessions = localStorage.getItem(this.sessionsKey);
      if (!existingSessions) {
        this.saveSessions([]);
        console.log('💾 [SessionStorage] Initialized empty sessions storage');
      }

      // Initialize content storage
      const existingContent = localStorage.getItem(this.storageKey);
      if (!existingContent) {
        this.saveContent({});
        console.log('💾 [SessionStorage] Initialized empty content storage');
      }
    } catch (error) {
      console.error('❌ [SessionStorage] Failed to initialize storage:', error);
    }
  }

  // Session Management
  public createSession(name: string, description?: string, theme?: string, tags?: string[]): ChatSession {
    const sessions = this.loadSessions();
    
    const newSession: ChatSession = {
      id: this.generateSessionId(),
      name,
      description,
      theme,
      createdAt: new Date(),
      lastActive: new Date(),
      contentCount: 0,
      isActive: true,
      tags: tags || []
    };

    sessions.unshift(newSession); // Add to beginning
    this.saveSessions(sessions);
    
    console.log('➕ [SessionStorage] Created new session:', newSession.id, name);
    return newSession;
  }

  public updateSession(sessionId: string, updates: Partial<ChatSession>): boolean {
    const sessions = this.loadSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex === -1) return false;

    sessions[sessionIndex] = {
      ...sessions[sessionIndex],
      ...updates,
      lastActive: new Date()
    };

    this.saveSessions(sessions);
    console.log('🔄 [SessionStorage] Updated session:', sessionId);
    return true;
  }

  public deleteSession(sessionId: string): boolean {
    const sessions = this.loadSessions();
    const filteredSessions = sessions.filter(s => s.id !== sessionId);
    
    if (filteredSessions.length === sessions.length) return false;

    // Also delete all content for this session
    const content = this.loadContent();
    delete content[sessionId];
    this.saveContent(content);

    this.saveSessions(filteredSessions);
    console.log('🗑️ [SessionStorage] Deleted session and content:', sessionId);
    return true;
  }

  public getSession(sessionId: string): ChatSession | null {
    const sessions = this.loadSessions();
    return sessions.find(s => s.id === sessionId) || null;
  }

  public getAllSessions(): ChatSession[] {
    return this.loadSessions();
  }

  public setActiveSession(sessionId: string): boolean {
    const sessions = this.loadSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex === -1) return false;

    // Set all sessions as inactive
    sessions.forEach(s => s.isActive = false);
    
    // Set the target session as active
    sessions[sessionIndex].isActive = true;
    sessions[sessionIndex].lastActive = new Date();

    this.saveSessions(sessions);
    console.log('🎯 [SessionStorage] Set active session:', sessionId);
    return true;
  }

  public getActiveSession(): ChatSession | null {
    const sessions = this.loadSessions();
    return sessions.find(s => s.isActive) || sessions[0] || null;
  }

  // Content Management
  public addContent(sessionId: string, content: Omit<SessionContent, 'sessionId' | 'savedAt' | 'version'>): void {
    const sessions = this.loadSessions();
    const session = sessions.find(s => s.id === sessionId);
    
    if (!session) {
      console.error('❌ [SessionStorage] Session not found:', sessionId);
      return;
    }

    const allContent = this.loadContent();
    const sessionContent = allContent[sessionId] || [];

    const newContent: SessionContent = {
      ...content,
      sessionId,
      savedAt: new Date(),
      version: this.version
    };

    // Add to beginning of session content
    sessionContent.unshift(newContent);

    // Update session content count
    session.contentCount = sessionContent.length;
    session.lastActive = new Date();

    // Clean up if over limit
    if (sessionContent.length > this.maxContentPerSession) {
      sessionContent.splice(this.maxContentPerSession);
      session.contentCount = sessionContent.length;
    }

    allContent[sessionId] = sessionContent;
    this.saveContent(allContent);
    this.saveSessions(sessions);

    console.log('➕ [SessionStorage] Added content to session:', sessionId, content.id);
  }

  public getSessionContent(sessionId: string): SessionContent[] {
    const content = this.loadContent();
    return content[sessionId] || [];
  }

  public getAllContent(): Record<string, SessionContent[]> {
    return this.loadContent();
  }

  public removeContent(sessionId: string, contentId: string): boolean {
    const allContent = this.loadContent();
    const sessionContent = allContent[sessionId];
    
    if (!sessionContent) return false;

    const filteredContent = sessionContent.filter(c => c.id !== contentId);
    
    if (filteredContent.length === sessionContent.length) return false;

    allContent[sessionId] = filteredContent;
    this.saveContent(allContent);

    // Update session content count
    const sessions = this.loadSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex !== -1) {
      sessions[sessionIndex].contentCount = filteredContent.length;
      this.saveSessions(sessions);
    }

    console.log('🗑️ [SessionStorage] Removed content from session:', sessionId, contentId);
    return true;
  }

  public clearSessionContent(sessionId: string): boolean {
    const allContent = this.loadContent();
    const sessions = this.loadSessions();
    
    if (!allContent[sessionId]) return false;

    delete allContent[sessionId];
    this.saveContent(allContent);

    // Update session content count
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex !== -1) {
      sessions[sessionIndex].contentCount = 0;
      this.saveSessions(sessions);
    }

    console.log('🧹 [SessionStorage] Cleared all content for session:', sessionId);
    return true;
  }

  // Search and Filter
  public searchSessions(query: string): ChatSession[] {
    const sessions = this.loadSessions();
    const lowerQuery = query.toLowerCase();
    
    return sessions.filter(session => 
      session.name.toLowerCase().includes(lowerQuery) ||
      session.description?.toLowerCase().includes(lowerQuery) ||
      session.theme?.toLowerCase().includes(lowerQuery) ||
      session.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  public getSessionsByTheme(theme: string): ChatSession[] {
    const sessions = this.loadSessions();
    return sessions.filter(session => session.theme === theme);
  }

  public getSessionsByTag(tag: string): ChatSession[] {
    const sessions = this.loadSessions();
    return sessions.filter(session => session.tags?.includes(tag));
  }

  // Statistics
  public getSessionStats(): SessionStats {
    const sessions = this.loadSessions();
    const allContent = this.loadContent();
    
    const totalContent = Object.values(allContent).reduce((sum, content) => sum + content.length, 0);
    const activeSession = sessions.find(s => s.isActive)?.id;
    
    const sessionsByTheme: Record<string, number> = {};
    sessions.forEach(session => {
      if (session.theme) {
        sessionsByTheme[session.theme] = (sessionsByTheme[session.theme] || 0) + 1;
      }
    });

    const recentSessions = sessions
      .sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime())
      .slice(0, 10);

    return {
      totalSessions: sessions.length,
      totalContent,
      activeSession,
      sessionsByTheme,
      recentSessions
    };
  }

  // Export/Import
  public exportSession(sessionId: string): string | null {
    const session = this.getSession(sessionId);
    const content = this.getSessionContent(sessionId);
    
    if (!session) return null;

    const exportData = {
      session,
      content,
      exportedAt: new Date().toISOString(),
      version: this.version
    };

    return JSON.stringify(exportData, null, 2);
  }

  public importSession(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.session || !data.content) {
        throw new Error('Invalid import data: missing session or content');
      }

      const sessions = this.loadSessions();
      const allContent = this.loadContent();

      // Check if session already exists
      const existingSession = sessions.find(s => s.id === data.session.id);
      if (existingSession) {
        // Update existing session
        const sessionIndex = sessions.findIndex(s => s.id === data.session.id);
        sessions[sessionIndex] = {
          ...data.session,
          lastActive: new Date()
        };
      } else {
        // Add new session
        sessions.unshift({
          ...data.session,
          lastActive: new Date()
        });
      }

      // Import content
      const importedContent = data.content.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
        savedAt: new Date(item.savedAt || Date.now()),
        version: this.version
      }));

      allContent[data.session.id] = importedContent;

      this.saveSessions(sessions);
      this.saveContent(allContent);

      console.log('📥 [SessionStorage] Imported session:', data.session.id);
      return true;
    } catch (error) {
      console.error('❌ [SessionStorage] Failed to import session:', error);
      return false;
    }
  }

  public exportAllSessions(): string {
    const sessions = this.loadSessions();
    const allContent = this.loadContent();
    
    const exportData = {
      sessions,
      content: allContent,
      exportedAt: new Date().toISOString(),
      version: this.version,
      stats: this.getSessionStats()
    };

    return JSON.stringify(exportData, null, 2);
  }

  public importAllSessions(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.sessions || !data.content) {
        throw new Error('Invalid import data: missing sessions or content');
      }

      // Import sessions
      const importedSessions = data.sessions.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        lastActive: new Date(session.lastActive)
      }));

      // Import content
      const importedContent: Record<string, SessionContent[]> = {};
      Object.entries(data.content).forEach(([sessionId, content]) => {
        importedContent[sessionId] = (content as any[]).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
          savedAt: new Date(item.savedAt || Date.now()),
          version: this.version
        }));
      });

      this.saveSessions(importedSessions);
      this.saveContent(importedContent);

      console.log('📥 [SessionStorage] Imported all sessions');
      return true;
    } catch (error) {
      console.error('❌ [SessionStorage] Failed to import all sessions:', error);
      return false;
    }
  }

  // Private helper methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveSessions(sessions: ChatSession[]): void {
    if (typeof window === 'undefined') return;

    try {
      const storageData = {
        sessions,
        lastUpdated: new Date().toISOString(),
        version: this.version
      };

      localStorage.setItem(this.sessionsKey, JSON.stringify(storageData));
    } catch (error) {
      console.error('❌ [SessionStorage] Failed to save sessions:', error);
    }
  }

  private loadSessions(): ChatSession[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.sessionsKey);
      if (!stored) return [];

      const data = JSON.parse(stored);
      
      // Convert timestamps back to Date objects
      const sessions = data.sessions.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        lastActive: new Date(session.lastActive)
      }));

      return sessions;
    } catch (error) {
      console.error('❌ [SessionStorage] Failed to load sessions:', error);
      return [];
    }
  }

  private saveContent(content: Record<string, SessionContent[]>): void {
    if (typeof window === 'undefined') return;

    try {
      const storageData = {
        content,
        lastUpdated: new Date().toISOString(),
        version: this.version
      };

      localStorage.setItem(this.storageKey, JSON.stringify(storageData));
    } catch (error) {
      console.error('❌ [SessionStorage] Failed to save content:', error);
    }
  }

  private loadContent(): Record<string, SessionContent[]> {
    if (typeof window === 'undefined') return {};

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return {};

      const data = JSON.parse(stored);
      
      // Convert timestamps back to Date objects
      const content: Record<string, SessionContent[]> = {};
      Object.entries(data.content).forEach(([sessionId, sessionContent]) => {
        content[sessionId] = (sessionContent as any[]).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
          savedAt: new Date(item.savedAt)
        }));
      });

      return content;
    } catch (error) {
      console.error('❌ [SessionStorage] Failed to load content:', error);
      return {};
    }
  }
}

// Export singleton instance
export const sessionStorage = SessionStorageManager.getInstance();
