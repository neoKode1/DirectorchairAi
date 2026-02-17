'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { savePersona } from '@/lib/personas-store';

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

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const previews: string[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        previews.push(ev.target?.result as string);
        if (previews.length === files.length) {
          setImagePreviews((prev) => [...prev, ...previews].slice(0, 8));
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(index: number) {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
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
        imageUrl: imagePreviews[0],
        characterSheet: {
          referenceImages: imagePreviews,
          generatedImages: null,
          status: 'pending',
          imageMetadata: imagePreviews.map((_, i) => ({ name: `image_${i}`, size: 0, type: 'image/jpeg', index: i })),
        },
        basePrice: Math.round(parseFloat(basePrice) * 100),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        contentRating,
        adultContentAllowed,
      });
      router.push(`/personas/${persona.id}`);
    } catch {
      setError('Failed to create persona');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/personas" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Personas
        </Link>

        <h1 className="text-2xl font-light tracking-[0.15em] uppercase text-foreground mb-2">Create Persona</h1>
        <p className="text-muted-foreground text-sm mb-8">Upload reference photos and set your persona details</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Image Upload */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-base font-medium text-foreground mb-1">Reference Photos</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Upload up to 8 high-quality photos: 4 face angles (front, left, right, back) + 4 body angles
            </p>
            <label className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity w-fit">
              <Upload className="w-4 h-4" /> Choose Files
              <input type="file" accept="image/*" multiple onChange={handleFilesSelected} className="hidden" />
            </label>
            {imagePreviews.length > 0 && (
              <>
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{imagePreviews.length} / 8 photos</p>
              </>
            )}
          </div>

          {/* Basic Info */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-base font-medium text-foreground">Basic Information</h2>
            <div>
              <label className="block text-sm text-foreground mb-1">Persona Name *</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Luna"
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm text-foreground mb-1">Rate (USD per session) *</label>
              <input type="number" required min="0" step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="9.99"
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm text-foreground mb-1">Description</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of your persona..."
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div>
              <label className="block text-sm text-foreground mb-1">Tags (comma-separated)</label>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., fantasy, mentor, wise"
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          {/* Content Settings */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-base font-medium text-foreground">Content Settings</h2>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="radio" name="contentRating" value="sfw" checked={contentRating === 'sfw'} onChange={() => setContentRating('sfw')} className="accent-foreground" />
                SFW
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="radio" name="contentRating" value="nsfw" checked={contentRating === 'nsfw'} onChange={() => setContentRating('nsfw')} className="accent-foreground" />
                NSFW
              </label>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={adultContentAllowed} onChange={(e) => setAdultContentAllowed(e.target.checked)} className="mt-1 accent-foreground" />
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
            className="w-full py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm">
            {loading ? 'Creating...' : 'Create Persona'}
          </button>
        </form>
      </div>
    </div>
  );
}

