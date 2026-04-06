'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { savePersona, resizeImageToThumbnail, storeFullResImages } from '@/lib/personas-store';

export default function CreatePersonaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [tags, setTags] = useState('');
  const [contentRating, setContentRating] = useState<'sfw' | 'nsfw'>('sfw');
  const [adultContentAllowed, setAdultContentAllowed] = useState(false);

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [fullResImages, setFullResImages] = useState<string[]>([]);

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const fullRes: string[] = [];
    let loaded = 0;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string;
        fullRes.push(dataUrl);
        loaded++;
        if (loaded === files.length) {
          // Store full-res in memory, thumbnails for localStorage
          setFullResImages((prev) => [...prev, ...fullRes].slice(0, 8));
          const thumbs = await Promise.all(fullRes.map((img) => resizeImageToThumbnail(img)));
          setImagePreviews((prev) => [...prev, ...thumbs].slice(0, 8));
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(index: number) {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setFullResImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name || !description || !basePrice || imagePreviews.length === 0) {
      setError('Please fill all required fields and upload at least one image.');
      return;
    }
    setLoading(true);
    try {
      const persona = savePersona({
        name,
        description,
        imageUrl: imagePreviews[0], // thumbnail — safe for localStorage
        characterSheet: {
          referenceImages: imagePreviews, // thumbnails for display
          generatedImages: null,
          status: 'pending',
          imageMetadata: imagePreviews.map((_, i) => ({ name: `image_${i}`, size: 0, type: 'image/jpeg', index: i })),
        },
        basePrice: Math.round(parseFloat(basePrice) * 100),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        contentRating,
        adultContentAllowed,
      });
      // Store full-res images in sessionStorage for character sheet generation
      if (fullResImages.length > 0) {
        storeFullResImages(persona.id, fullResImages);
      }
      router.push(`/personas/${persona.id}`);
    } catch {
      setError('Failed to create persona');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link href="/personas" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-xs tracking-wider transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> BACK TO PERSONAS
        </Link>

        <p className="text-xs text-muted-foreground/60 tracking-widest mb-3">NEW</p>
        <h1 className="font-display text-3xl font-normal text-foreground tracking-tight mb-2">Create Persona</h1>
        <p className="text-sm text-muted-foreground font-light mb-10">Upload reference photos and set your persona details</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="border border-destructive/30 p-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Image Upload */}
          <div className="border border-border p-6">
            <h2 className="text-sm font-medium text-foreground tracking-tight mb-1">Reference Photos</h2>
            <p className="text-xs text-muted-foreground/60 mb-4">
              Upload multiple photos of the same person from different angles and expressions. More variety = better character consistency.
            </p>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-medium tracking-wider cursor-pointer hover:bg-primary/90 transition-all">
              <Upload className="w-3.5 h-3.5" /> CHOOSE FILES
              <input type="file" accept="image/*" multiple onChange={handleFilesSelected} className="hidden" />
            </label>
            {imagePreviews.length > 0 && (
              <>
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden border border-border">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-background/80 text-foreground w-5 h-5 flex items-center justify-center text-xs hover:bg-red-500 hover:text-white transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground/60 mt-2">{imagePreviews.length} / 8 photos</p>
              </>
            )}
          </div>

          {/* Basic Info */}
          <div className="border border-border p-6 space-y-4">
            <h2 className="text-sm font-medium text-foreground tracking-tight">Basic Information</h2>
            <div>
              <label className="block text-xs text-muted-foreground tracking-wider uppercase mb-1">Persona Name *</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Luna"
                className="w-full bg-card border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground tracking-wider uppercase mb-1">Rate (USD per session) *</label>
              <input type="number" required min="0" step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="9.99"
                className="w-full bg-card border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground tracking-wider uppercase mb-1">Description</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of your persona..."
                className="w-full bg-card border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring resize-none" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground tracking-wider uppercase mb-1">Tags (comma-separated)</label>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., fantasy, mentor, wise"
                className="w-full bg-card border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring" />
            </div>
          </div>

          {/* Content Settings */}
          <div className="border border-border p-6 space-y-4">
            <h2 className="text-sm font-medium text-foreground tracking-tight">Content Settings</h2>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground">
                <input type="radio" name="contentRating" value="sfw" checked={contentRating === 'sfw'} onChange={() => setContentRating('sfw')} className="accent-current" />
                SFW
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground">
                <input type="radio" name="contentRating" value="nsfw" checked={contentRating === 'nsfw'} onChange={() => setContentRating('nsfw')} className="accent-current" />
                NSFW
              </label>
            </div>
            <div className="border border-border p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={adultContentAllowed} onChange={(e) => setAdultContentAllowed(e.target.checked)} className="mt-1 accent-current" />
                <div>
                  <span className="text-sm font-medium text-foreground">Allow Adult Content Usage</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Allow licensees to use this persona in adult content production.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading || imagePreviews.length === 0}
            className="w-full py-3 bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm tracking-wider">
            {loading ? 'CREATING...' : 'CREATE PERSONA'}
          </button>
        </form>
      </div>
    </div>
  );
}

