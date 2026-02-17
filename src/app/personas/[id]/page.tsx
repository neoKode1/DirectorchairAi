'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Download, Eye, Loader2, Sparkles } from 'lucide-react';
import { type Persona, getPersona, toggleLike, updatePersona } from '@/lib/personas-store';

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function PersonaDetailPage() {
  const params = useParams();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Persona not found</p>
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
      const res = await fetch('/api/personas/generate-character-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId: persona.id, referenceImages: persona.characterSheet.referenceImages }),
      });
      const data = await res.json();
      if (data.success && data.images) {
        const updated = updatePersona(persona.id, {
          characterSheet: { ...persona.characterSheet, generatedImages: data.images.map((img: { url: string }) => img.url), status: 'ready' },
        });
        if (updated) setPersona(updated);
      }
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/personas" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Feed
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div>
            <img src={persona.imageUrl} alt={persona.name} className="w-full aspect-square object-cover rounded-lg border border-border" />
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-light tracking-[0.1em] text-foreground mb-2">{persona.name}</h1>
              <p className="text-muted-foreground text-sm">{persona.description}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400" />
              <div>
                <p className="text-sm font-semibold text-foreground">{persona.creatorUsername}</p>
                <p className="text-xs text-muted-foreground">Creator</p>
              </div>
            </div>

            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-muted-foreground" /><span className="font-semibold text-foreground">{persona.likes}</span><span className="text-muted-foreground">likes</span></div>
              <div className="flex items-center gap-1.5"><Download className="w-4 h-4 text-muted-foreground" /><span className="font-semibold text-foreground">{persona.downloads}</span><span className="text-muted-foreground">downloads</span></div>
              <div className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-muted-foreground" /><span className="font-semibold text-foreground">{persona.views}</span><span className="text-muted-foreground">views</span></div>
            </div>

            {persona.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {persona.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-muted text-xs text-muted-foreground rounded-full">#{tag}</span>
                ))}
              </div>
            )}

            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">{formatPrice(persona.basePrice)}</span>
                <span className="text-muted-foreground text-sm">starting price</span>
              </div>
              <button onClick={() => setShowLicenseModal(true)} className="w-full py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity text-sm">
                Purchase License
              </button>
              <button onClick={handleLike} className="w-full py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors text-sm">
                {persona.isLiked ? '❤️ Liked' : '🤍 Like'}
              </button>
            </div>
          </div>
        </div>

        {/* Reference Images */}
        {persona.characterSheet.referenceImages.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-light tracking-[0.1em] text-foreground mb-4">Reference Images</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {persona.characterSheet.referenceImages.map((url, i) => (
                <img key={i} src={url} alt={`Reference ${i + 1}`} className="w-full aspect-square object-cover rounded-lg border border-border" />
              ))}
            </div>
          </div>
        )}

        {/* Character Sheet */}
        {persona.characterSheet.generatedImages && persona.characterSheet.generatedImages.length > 0 ? (
          <div className="mt-12">
            <h2 className="text-xl font-light tracking-[0.1em] text-foreground mb-2">Character Sheet</h2>
            <p className="text-muted-foreground text-sm mb-6">AI-generated character variations</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {persona.characterSheet.generatedImages.map((url, i) => (
                <div key={i} className="aspect-square relative group rounded-lg overflow-hidden border border-border">
                  <img src={url} alt={`Variation ${i + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a href={url} download={`character-${i + 1}.png`} className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm backdrop-blur-sm hover:bg-white/30">
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-12">
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              {generating ? (
                <>
                  <Loader2 className="w-10 h-10 animate-spin text-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Generating Character Sheet...</h3>
                  <p className="text-muted-foreground text-sm">This may take a few minutes.</p>
                </>
              ) : (
                <>
                  <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Generate Character Sheet</h3>
                  <p className="text-muted-foreground text-sm mb-4">AI will create character variations from your reference photos.</p>
                  <button onClick={handleGenerateSheet}
                    disabled={persona.characterSheet.referenceImages.length === 0}
                    className="px-6 py-2 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity text-sm disabled:opacity-50">
                    Generate with AI
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* License Modal */}
      {showLicenseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowLicenseModal(false)}>
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-foreground">Choose License</h2>
              <button onClick={() => setShowLicenseModal(false)} className="text-muted-foreground hover:text-foreground text-xl">&times;</button>
            </div>
            <div className="space-y-4">
              {(Object.entries(licenseOptions) as [typeof selectedLicense, typeof licenseOptions.personal][]).map(([key, option]) => (
                <label key={key} className="block cursor-pointer">
                  <input type="radio" name="license" value={key} checked={selectedLicense === key} onChange={() => setSelectedLicense(key)} className="sr-only peer" />
                  <div className="bg-background border-2 border-border peer-checked:border-foreground rounded-lg p-5 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-foreground">{option.name}</h3>
                      <span className="text-xl font-bold text-foreground">{formatPrice(option.price)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
                    <ul className="space-y-1">
                      {option.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                          <span className="text-green-500">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-6 flex gap-4">
              <button onClick={() => setShowLicenseModal(false)} className="flex-1 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 text-sm">Cancel</button>
              <button className="flex-1 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 text-sm">
                Purchase {formatPrice(licenseOptions[selectedLicense].price)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

