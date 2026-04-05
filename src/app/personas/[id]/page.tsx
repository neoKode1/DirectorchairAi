'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Download, Eye, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { type Persona, getPersona, toggleLike, updatePersona, deletePersona, getFullResImages } from '@/lib/personas-store';
import { Toaster } from '@/components/ui/toaster';
import { ToastProvider } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function PersonaDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<'personal' | 'commercial' | 'exclusive'>('personal');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (params.id) {
      const p = getPersona(params.id as string);
      setPersona(p);
    }
  }, [params.id]);

  if (!persona) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <p className="text-neutral-500">Persona not found</p>
      </div>
    );
  }

  const licenseOptions = {
    personal: { name: 'Personal License', price: persona.basePrice, description: 'For personal use only.', features: ['Personal use only', 'Lifetime access', 'Updates included'] },
    commercial: { name: 'Commercial License', price: persona.basePrice * 3, description: 'For commercial projects.', features: ['Commercial use', 'Lifetime access', 'Updates included', 'Priority support'] },
    exclusive: { name: 'Exclusive License', price: persona.basePrice * 10, description: 'Exclusive rights. Removed from marketplace.', features: ['Exclusive ownership', 'Full commercial rights', 'Source files included'] },
  };

  function handleLike() {
    const result = toggleLike(persona!.id);
    if (result) setPersona((p) => p ? { ...p, ...result } : p);
  }

  async function handleGenerateSheet() {
    if (!persona || persona.characterSheet.referenceImages.length === 0) return;
    setGenerating(true);
    try {
      // Prefer full-res images from sessionStorage; fall back to thumbnails
      const fullRes = getFullResImages(persona.id);
      const imagesToSend = fullRes && fullRes.length > 0 ? fullRes : persona.characterSheet.referenceImages;

      const res = await fetch('/api/personas/generate-character-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId: persona.id, referenceImages: imagesToSend }),
      });
      const data = await res.json();
      if (data.success && data.images) {
        const updated = updatePersona(persona.id, {
          characterSheet: { ...persona.characterSheet, generatedImages: data.images.map((img: { url: string }) => img.url), status: 'ready' },
        });
        if (updated) setPersona(updated);
        toast({ title: 'Character Sheet Ready', description: `${data.images.length} variations generated!` });
      } else {
        throw new Error(data.error || 'Generation returned no images');
      }
    } catch (err) {
      console.error('Generation failed:', err);
      toast({ title: 'Generation Failed', description: err instanceof Error ? err.message : 'Could not generate character sheet.', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  }

  function handleDelete() {
    if (!persona) return;
    deletePersona(persona.id);
    toast({ title: 'Persona Deleted', description: `"${persona.name}" has been removed.` });
    router.push('/personas');
  }

  function handlePurchase() {
    toast({ title: 'Coming Soon', description: 'Licensing and payments will be available in a future update.' });
    setShowLicenseModal(false);
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-16">
        <Link href="/personas" className="inline-flex items-center gap-2 text-neutral-500 hover:text-white mb-8 text-xs tracking-wider transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> BACK TO FEED
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div>
            <img src={persona.imageUrl} alt={persona.name} className="w-full aspect-square object-cover border border-neutral-800" />
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <p className="text-xs text-neutral-600 tracking-widest mb-2">PERSONA</p>
              <h1 className="font-display text-3xl font-normal text-white tracking-tight mb-2">{persona.name}</h1>
              <p className="text-sm text-neutral-500 font-light">{persona.description}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center">
                <span className="text-xs text-neutral-400">{persona.creatorUsername[0]}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{persona.creatorUsername}</p>
                <p className="text-xs text-neutral-600">Creator</p>
              </div>
            </div>

            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-neutral-600" /><span className="font-medium text-white">{persona.likes}</span><span className="text-neutral-500">likes</span></div>
              <div className="flex items-center gap-1.5"><Download className="w-4 h-4 text-neutral-600" /><span className="font-medium text-white">{persona.downloads}</span><span className="text-neutral-500">downloads</span></div>
              <div className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-neutral-600" /><span className="font-medium text-white">{persona.views}</span><span className="text-neutral-500">views</span></div>
            </div>

            {persona.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {persona.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 border border-neutral-800 text-xs text-neutral-500">#{tag}</span>
                ))}
              </div>
            )}

            <div className="border border-neutral-800 p-6 space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-medium text-white">{formatPrice(persona.basePrice)}</span>
                <span className="text-neutral-500 text-sm font-light">starting price</span>
              </div>
              <button onClick={() => setShowLicenseModal(true)} className="w-full py-3 bg-white text-neutral-950 font-medium hover:bg-neutral-100 transition-all text-sm tracking-wider">
                PURCHASE LICENSE
              </button>
              <button onClick={handleLike} className="w-full py-3 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 transition-all text-sm tracking-wider">
                {persona.isLiked ? '❤️ LIKED' : '🤍 LIKE'}
              </button>
              {persona.creatorUsername === 'You' && (
                <button onClick={() => setShowDeleteConfirm(true)} className="w-full py-3 border border-red-500/30 text-red-400 hover:text-red-300 hover:border-red-500/60 transition-all text-sm tracking-wider flex items-center justify-center gap-2">
                  <Trash2 className="w-3.5 h-3.5" /> DELETE PERSONA
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reference Images */}
        {persona.characterSheet.referenceImages.length > 0 && (
          <div className="mt-16">
            <p className="text-xs text-neutral-600 tracking-widest mb-3">REFERENCES</p>
            <h2 className="font-display text-2xl font-normal text-white tracking-tight mb-6">Reference Images</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {persona.characterSheet.referenceImages.map((url, i) => (
                <img key={i} src={url} alt={`Reference ${i + 1}`} className="w-full aspect-square object-cover border border-neutral-800" />
              ))}
            </div>
          </div>
        )}

        {/* Character Sheet */}
        {persona.characterSheet.generatedImages && persona.characterSheet.generatedImages.length > 0 ? (
          <div className="mt-16">
            <p className="text-xs text-neutral-600 tracking-widest mb-3">AI GENERATED</p>
            <h2 className="font-display text-2xl font-normal text-white tracking-tight mb-2">Character Sheet</h2>
            <p className="text-sm text-neutral-500 font-light mb-6">AI-generated character variations</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {persona.characterSheet.generatedImages.map((url, i) => (
                <div key={i} className="aspect-square relative group overflow-hidden border border-neutral-800">
                  <img src={url} alt={`Variation ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a href={url} download={`character-${i + 1}.png`} className="px-4 py-2 border border-neutral-600 text-white text-xs tracking-wider hover:bg-white/10 transition-colors">
                      DOWNLOAD
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-16">
            <div className="border border-neutral-800 p-12 text-center">
              {generating ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin text-neutral-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white tracking-tight mb-2">Generating Character Sheet...</h3>
                  <p className="text-neutral-500 text-sm font-light">This may take a few minutes.</p>
                </>
              ) : (
                <>
                  <Sparkles className="w-8 h-8 text-neutral-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white tracking-tight mb-2">Generate Character Sheet</h3>
                  <p className="text-neutral-500 text-sm font-light mb-6">AI will create character variations from your reference photos.</p>
                  <button onClick={handleGenerateSheet}
                    disabled={persona.characterSheet.referenceImages.length === 0}
                    className="px-6 py-3 bg-white text-neutral-950 text-xs font-medium tracking-wider hover:bg-neutral-100 transition-all disabled:opacity-40">
                    GENERATE WITH AI
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* License Modal */}
      {showLicenseModal && (
        <div className="fixed inset-0 bg-neutral-950/90 flex items-center justify-center z-50 p-4" onClick={() => setShowLicenseModal(false)}>
          <div className="bg-neutral-900 border border-neutral-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-medium text-white tracking-tight">Choose License</h2>
              <button onClick={() => setShowLicenseModal(false)} className="text-neutral-500 hover:text-white text-xl transition-colors">&times;</button>
            </div>
            <div className="space-y-4">
              {(Object.entries(licenseOptions) as [typeof selectedLicense, typeof licenseOptions.personal][]).map(([key, option]) => (
                <label key={key} className="block cursor-pointer">
                  <input type="radio" name="license" value={key} checked={selectedLicense === key} onChange={() => setSelectedLicense(key)} className="sr-only peer" />
                  <div className="border border-neutral-800 peer-checked:border-white p-5 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-white">{option.name}</h3>
                      <span className="text-xl font-medium text-white">{formatPrice(option.price)}</span>
                    </div>
                    <p className="text-sm text-neutral-500 font-light mb-3">{option.description}</p>
                    <ul className="space-y-1">
                      {option.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-neutral-400">
                          <span className="text-neutral-500">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-8 flex gap-4">
              <button onClick={() => setShowLicenseModal(false)} className="flex-1 py-3 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 transition-all text-sm tracking-wider">CANCEL</button>
              <button onClick={handlePurchase} className="flex-1 py-3 bg-white text-neutral-950 font-medium hover:bg-neutral-100 transition-all text-sm tracking-wider">
                PURCHASE {formatPrice(licenseOptions[selectedLicense].price)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-neutral-950/90 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-neutral-900 border border-neutral-800 max-w-sm w-full p-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-medium text-white tracking-tight mb-2">Delete Persona?</h2>
            <p className="text-sm text-neutral-500 font-light mb-6">
              This will permanently delete &ldquo;{persona?.name}&rdquo; and all associated data. This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 transition-all text-sm tracking-wider">CANCEL</button>
              <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white font-medium hover:bg-red-500 transition-all text-sm tracking-wider">DELETE</button>
            </div>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
}

export default function PersonaDetailPage() {
  return (
    <ToastProvider>
      <PersonaDetailContent />
    </ToastProvider>
  );
}

