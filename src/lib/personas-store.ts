// localStorage-based persistence for Personas
// Replaces Cloudflare D1 database from the original SvelteKit app

export interface Persona {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  characterSheet: {
    referenceImages: string[];
    generatedImages: string[] | null;
    status: 'pending' | 'generating' | 'ready';
    imageMetadata: Array<{ name: string; size: number; type: string; index: number }>;
  };
  basePrice: number;
  tags: string[];
  contentRating: 'sfw' | 'nsfw';
  adultContentAllowed: boolean;
  likes: number;
  downloads: number;
  views: number;
  isLiked: boolean;
  creatorUsername: string;
  createdAt: string;
}

const STORAGE_KEY = 'directorchair-personas';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function getPersonas(): Persona[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getPersona(id: string): Persona | null {
  const personas = getPersonas();
  return personas.find((p) => p.id === id) || null;
}

export function savePersona(persona: Omit<Persona, 'id' | 'likes' | 'downloads' | 'views' | 'isLiked' | 'creatorUsername' | 'createdAt'>): Persona {
  const personas = getPersonas();
  const newPersona: Persona = {
    ...persona,
    id: generateId(),
    likes: 0,
    downloads: 0,
    views: 0,
    isLiked: false,
    creatorUsername: 'You',
    createdAt: new Date().toISOString(),
  };
  personas.unshift(newPersona);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(personas));
  return newPersona;
}

export function updatePersona(id: string, updates: Partial<Persona>): Persona | null {
  const personas = getPersonas();
  const index = personas.findIndex((p) => p.id === id);
  if (index === -1) return null;
  personas[index] = { ...personas[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(personas));
  return personas[index];
}

export function toggleLike(id: string): { likes: number; isLiked: boolean } | null {
  const personas = getPersonas();
  const index = personas.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const persona = personas[index];
  persona.isLiked = !persona.isLiked;
  persona.likes += persona.isLiked ? 1 : -1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(personas));
  return { likes: persona.likes, isLiked: persona.isLiked };
}

export function deletePersona(id: string): boolean {
  const personas = getPersonas();
  const filtered = personas.filter((p) => p.id !== id);
  if (filtered.length === personas.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

// Seed demo data if store is empty
export function seedDemoPersonas(): void {
  if (getPersonas().length > 0) return;
  const demos: Omit<Persona, 'id' | 'likes' | 'downloads' | 'views' | 'isLiked' | 'creatorUsername' | 'createdAt'>[] = [
    {
      name: 'Luna',
      description: 'Ethereal fantasy character with silver hair and violet eyes. Perfect for fantasy film projects.',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=800&fit=crop',
      characterSheet: { referenceImages: [], generatedImages: null, status: 'pending', imageMetadata: [] },
      basePrice: 999, tags: ['fantasy', 'ethereal', 'silver-hair'], contentRating: 'sfw', adultContentAllowed: false,
    },
    {
      name: 'Rex Steele',
      description: 'Rugged action hero type. Strong jawline, weathered look. Great for action sequences.',
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=800&fit=crop',
      characterSheet: { referenceImages: [], generatedImages: null, status: 'pending', imageMetadata: [] },
      basePrice: 1499, tags: ['action', 'hero', 'rugged'], contentRating: 'sfw', adultContentAllowed: false,
    },
    {
      name: 'Aria Chen',
      description: 'Modern tech executive persona. Sleek, confident, commanding presence for corporate narratives.',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=800&fit=crop',
      characterSheet: { referenceImages: [], generatedImages: null, status: 'pending', imageMetadata: [] },
      basePrice: 1299, tags: ['corporate', 'modern', 'tech'], contentRating: 'sfw', adultContentAllowed: false,
    },
  ];
  demos.forEach((d) => {
    const persona: Persona = {
      ...d, id: generateId(), likes: Math.floor(Math.random() * 50) + 5,
      downloads: Math.floor(Math.random() * 20), views: Math.floor(Math.random() * 200) + 20,
      isLiked: false, creatorUsername: 'DirectorChair', createdAt: new Date().toISOString(),
    };
    const personas = getPersonas();
    personas.push(persona);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(personas));
  });
}

