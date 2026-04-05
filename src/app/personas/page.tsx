'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, Bookmark, Plus } from 'lucide-react';
import { type Persona, getPersonas, toggleLike, seedDemoPersonas } from '@/lib/personas-store';

function PostCard({ persona, onLike }: { persona: Persona; onLike: (id: string) => void }) {
  return (
    <article className="border border-neutral-800 overflow-hidden max-w-[470px] w-full mx-auto group">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center">
            <span className="text-xs font-medium text-neutral-400">{persona.creatorUsername[0]}</span>
          </div>
          <Link href={`/personas/${persona.id}`} className="text-sm font-medium text-white hover:text-neutral-300 transition-colors">
            {persona.creatorUsername}
          </Link>
        </div>
      </div>

      {/* Image */}
      <Link href={`/personas/${persona.id}`}>
        <div className="relative overflow-hidden">
          <img
            src={persona.imageUrl}
            alt={persona.name}
            className="w-full aspect-square object-cover cursor-pointer transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>

      {/* Actions */}
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button onClick={() => onLike(persona.id)} className="hover:text-neutral-400 transition-colors">
              <Heart className={`w-5 h-5 ${persona.isLiked ? 'fill-red-500 text-red-500' : 'text-neutral-300'}`} />
            </button>
            <Link href={`/personas/${persona.id}`} className="hover:text-neutral-400 transition-colors">
              <MessageCircle className="w-5 h-5 text-neutral-300" />
            </Link>
            <button className="hover:text-neutral-400 transition-colors">
              <Share2 className="w-5 h-5 text-neutral-300" />
            </button>
          </div>
          <button className="hover:text-neutral-400 transition-colors">
            <Bookmark className="w-5 h-5 text-neutral-300" />
          </button>
        </div>

        <span className="text-xs font-medium text-white">
          {persona.likes.toLocaleString()} likes
        </span>

        <div className="text-sm mt-1">
          <Link href={`/personas/${persona.id}`} className="font-medium text-white mr-2 hover:text-neutral-300 transition-colors">
            {persona.name}
          </Link>
          <span className="text-neutral-500 font-light">{persona.description}</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2">
          {persona.tags.map((tag) => (
            <span key={tag} className="text-xs text-neutral-500">#{tag}</span>
          ))}
        </div>

        <p className="text-[10px] text-neutral-600 uppercase mt-2 tracking-widest">
          {new Date(persona.createdAt).toLocaleDateString()}
        </p>
      </div>
    </article>
  );
}

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    seedDemoPersonas();
    setPersonas(getPersonas());
    setLoaded(true);
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
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-[470px] mx-auto py-16 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-xs text-neutral-600 tracking-widest mb-2">GALLERY</p>
            <h1 className="font-display text-3xl font-normal text-white tracking-tight">Personas</h1>
          </div>
          <Link
            href="/personas/create"
            className="flex items-center gap-2 px-4 py-2 bg-white text-neutral-950 text-xs font-medium tracking-wider hover:bg-neutral-100 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            CREATE
          </Link>
        </div>

        {/* Feed */}
        <div className="space-y-8">
          {personas.map((persona) => (
            <PostCard key={persona.id} persona={persona} onLike={handleLike} />
          ))}
        </div>

        {!loaded && (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neutral-500"></div>
          </div>
        )}

        {loaded && personas.length === 0 && (
          <div className="text-center py-24">
            <p className="text-neutral-500 mb-6 text-sm font-light">No personas yet</p>
            <Link
              href="/personas/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-neutral-950 text-xs font-medium tracking-wider hover:bg-neutral-100 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              CREATE YOUR FIRST PERSONA
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

