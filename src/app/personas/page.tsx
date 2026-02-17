'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, Bookmark, Plus } from 'lucide-react';
import { type Persona, getPersonas, toggleLike, seedDemoPersonas } from '@/lib/personas-store';

function PostCard({ persona, onLike }: { persona: Persona; onLike: (id: string) => void }) {
  return (
    <article className="bg-card border border-border rounded-lg overflow-hidden max-w-[470px] w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
              <span className="text-xs font-bold text-foreground">{persona.creatorUsername[0]}</span>
            </div>
          </div>
          <Link href={`/personas/${persona.id}`} className="text-sm font-semibold text-foreground hover:text-foreground/80">
            {persona.creatorUsername}
          </Link>
        </div>
      </div>

      {/* Image */}
      <Link href={`/personas/${persona.id}`}>
        <img
          src={persona.imageUrl}
          alt={persona.name}
          className="w-full aspect-square object-cover cursor-pointer"
        />
      </Link>

      {/* Actions */}
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button onClick={() => onLike(persona.id)} className="hover:text-foreground/60 transition-colors">
              <Heart className={`w-6 h-6 ${persona.isLiked ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
            </button>
            <Link href={`/personas/${persona.id}`} className="hover:text-foreground/60 transition-colors">
              <MessageCircle className="w-6 h-6 text-foreground" />
            </Link>
            <button className="hover:text-foreground/60 transition-colors">
              <Share2 className="w-6 h-6 text-foreground" />
            </button>
          </div>
          <button className="hover:text-foreground/60 transition-colors">
            <Bookmark className="w-6 h-6 text-foreground" />
          </button>
        </div>

        <button className="text-sm font-semibold text-foreground">
          {persona.likes.toLocaleString()} likes
        </button>

        <div className="text-sm mt-1">
          <Link href={`/personas/${persona.id}`} className="font-semibold text-foreground mr-2">
            {persona.name}
          </Link>
          <span className="text-muted-foreground">{persona.description}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2">
          {persona.tags.map((tag) => (
            <span key={tag} className="text-xs text-blue-500 dark:text-blue-400">#{tag}</span>
          ))}
        </div>

        <p className="text-[10px] text-muted-foreground/60 uppercase mt-2 tracking-wide">
          {new Date(persona.createdAt).toLocaleDateString()}
        </p>
      </div>
    </article>
  );
}

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);

  useEffect(() => {
    seedDemoPersonas();
    setPersonas(getPersonas());
  }, []);

  function handleLike(id: string) {
    const result = toggleLike(id);
    if (result) {
      setPersonas((prev) =>
        prev.map((p) => (p.id === id ? { ...p, likes: result.likes, isLiked: result.isLiked } : p))
      );
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[470px] mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-light tracking-[0.15em] uppercase text-foreground">Personas</h1>
          <Link
            href="/personas/create"
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Create
          </Link>
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {personas.map((persona) => (
            <PostCard key={persona.id} persona={persona} onLike={handleLike} />
          ))}
        </div>

        {personas.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">No personas yet</p>
            <Link
              href="/personas/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Create your first persona
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

