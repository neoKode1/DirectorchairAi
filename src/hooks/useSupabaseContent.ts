import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  saveGeneratedContent, 
  getUserContent, 
  deleteUserContent, 
  updateUserCredits,
  getUserProfile,
  type GeneratedContent 
} from '@/lib/supabase';

export function useSupabaseContent() {
  const { data: session } = useSession();
  const [content, setContent] = useState<GeneratedContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [userCredits, setUserCredits] = useState(0);

  // Load user content on mount and when session changes
  useEffect(() => {
    if (session?.user?.id) {
      loadUserContent();
      loadUserProfile();
    }
  }, [session?.user?.id]);

  const loadUserContent = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await getUserContent(session.user.id);
      if (error) {
        console.error('Error loading user content:', error);
      } else {
        setContent(data || []);
      }
    } catch (error) {
      console.error('Error loading user content:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    if (!session?.user?.id) return;
    
    try {
      const { data, error } = await getUserProfile(session.user.id);
      if (error) {
        console.error('Error loading user profile:', error);
      } else if (data) {
        setUserCredits(data.credits);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const saveContent = async (contentData: {
    type: 'image' | 'video' | 'audio';
    prompt: string;
    url: string;
    model_used: string;
    metadata?: Record<string, any>;
  }) => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await saveGeneratedContent({
        user_id: session.user.id,
        ...contentData
      });

      if (error) {
        throw error;
      }

      if (data) {
        setContent(prev => [data, ...prev]);
      }

      return data;
    } catch (error) {
      console.error('Error saving content:', error);
      throw error;
    }
  };

  const deleteContent = async (contentId: string) => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const { error } = await deleteUserContent(contentId, session.user.id);
      
      if (error) {
        throw error;
      }

      setContent(prev => prev.filter(item => item.id !== contentId));
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  };

  const deductCredits = async (amount: number = 1) => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    const newCredits = Math.max(0, userCredits - amount);
    
    try {
      const { data, error } = await updateUserCredits(session.user.id, newCredits);
      
      if (error) {
        throw error;
      }

      if (data) {
        setUserCredits(data.credits);
      }

      return newCredits;
    } catch (error) {
      console.error('Error updating credits:', error);
      throw error;
    }
  };

  const hasCredits = (amount: number = 1) => {
    return userCredits >= amount;
  };

  return {
    content,
    loading,
    userCredits,
    saveContent,
    deleteContent,
    deductCredits,
    hasCredits,
    refreshContent: loadUserContent,
    refreshProfile: loadUserProfile
  };
}

// Hook for managing local storage content migration
export function useContentMigration() {
  const { saveContent } = useSupabaseContent();
  const { data: session } = useSession();

  const migrateLocalContent = async () => {
    if (!session?.user?.id) return;

    try {
      // Get content from localStorage
      const localContent = localStorage.getItem('directorchair-content');
      if (!localContent) return;

      const parsedContent = JSON.parse(localContent);
      if (!Array.isArray(parsedContent)) return;

      // Migrate each item to Supabase
      for (const item of parsedContent) {
        if (item.url && item.prompt) {
          try {
            await saveContent({
              type: item.type || 'image',
              prompt: item.prompt,
              url: item.url,
              model_used: item.model || 'unknown',
              metadata: {
                migrated: true,
                originalTimestamp: item.timestamp
              }
            });
          } catch (error) {
            console.error('Error migrating item:', error);
          }
        }
      }

      // Clear localStorage after successful migration
      localStorage.removeItem('directorchair-content');
      console.log('Content migration completed');
    } catch (error) {
      console.error('Error during content migration:', error);
    }
  };

  return { migrateLocalContent };
}
