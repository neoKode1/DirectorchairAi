import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { button as Button } from "@/components/ui/button";
import { STYLE_PRESETS, StylePreset, StyleReference, getModelStyleSupport } from "@/lib/fal";
import { falClient } from "@/lib/fal";
import Image from "next/image";
import { toast } from "sonner";

interface StyleSelectorProps {
  modelId: string;
  onStyleChange: (style: {
    preset?: StylePreset;
    reference?: StyleReference;
    strength: number;
  }) => void;
}

export function StyleSelector({ modelId, onStyleChange }: StyleSelectorProps) {
  const [selectedType, setSelectedType] = useState<"preset" | "reference">("preset");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("cinematic");
  const [styleStrength, setStyleStrength] = useState(0.8);
  const [styleImageUrl, setStyleImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Get model style support
  const styleSupport = getModelStyleSupport(modelId);
  const { supportsStylePresets, supportsStyleReference, maxStyleStrength } = styleSupport;

  // Reset state when model changes
  useEffect(() => {
    setSelectedType("preset");
    setSelectedPresetId("cinematic");
    setStyleStrength(Math.min(0.8, maxStyleStrength));
    setStyleImageUrl("");
    onStyleChange({ strength: Math.min(0.8, maxStyleStrength) });
  }, [modelId, maxStyleStrength, onStyleChange]);

  const handlePresetChange = (presetId: string) => {
    if (!supportsStylePresets) {
      toast.error("This model does not support style presets");
      return;
    }

    setSelectedPresetId(presetId);
    const preset = STYLE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      onStyleChange({
        preset,
        strength: styleStrength,
      });
    }
  };

  const handleStrengthChange = (value: number[]) => {
    const newStrength = Math.min(value[0], maxStyleStrength);
    setStyleStrength(newStrength);

    if (selectedType === "preset" && supportsStylePresets) {
      const preset = STYLE_PRESETS.find((p) => p.id === selectedPresetId);
      if (preset) {
        onStyleChange({
          preset,
          strength: newStrength,
        });
      }
    } else if (selectedType === "reference" && supportsStyleReference && styleImageUrl) {
      onStyleChange({
        reference: {
          url: styleImageUrl,
          weight: newStrength,
        },
        strength: newStrength,
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!supportsStyleReference) {
      toast.error("This model does not support style reference images");
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await falClient.storage.upload(file);
      setStyleImageUrl(url);
      onStyleChange({
        reference: {
          url,
          weight: styleStrength,
        },
        strength: styleStrength,
      });
      toast.success("Style reference image uploaded successfully");
    } catch (error) {
      console.error("Error uploading style image:", error);
      toast.error("Failed to upload style reference image");
    } finally {
      setIsUploading(false);
    }
  };

  // If model doesn't support any style features, don't render the component
  if (!supportsStylePresets && !supportsStyleReference) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {supportsStylePresets && supportsStyleReference && (
          <RadioGroup
            defaultValue="preset"
            onValueChange={(value: "preset" | "reference") => setSelectedType(value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="preset" id="preset" />
              <Label htmlFor="preset">Style Preset</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="reference" id="reference" />
              <Label htmlFor="reference">Reference Image</Label>
            </div>
          </RadioGroup>
        )}

        {((selectedType === "preset" && supportsStylePresets) || !supportsStyleReference) && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            {STYLE_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className={`p-3 border rounded-lg cursor-pointer ${
                  selectedPresetId === preset.id ? "border-primary" : "border-gray-200"
                }`}
                onClick={() => handlePresetChange(preset.id)}
              >
                {preset.previewImageUrl && (
                  <div className="relative w-full h-24 mb-2">
                    <Image
                      src={preset.previewImageUrl}
                      alt={preset.label}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <h3 className="font-medium">{preset.label}</h3>
                <p className="text-sm text-gray-500">{preset.description}</p>
              </div>
            ))}
          </div>
        )}

        {((selectedType === "reference" && supportsStyleReference) || !supportsStylePresets) && (
          <div className="space-y-4 mt-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            {styleImageUrl && (
              <div className="relative w-full h-48">
                <Image
                  src={styleImageUrl}
                  alt="Style reference"
                  fill
                  className="object-contain rounded"
                />
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label>Style Strength: {styleStrength.toFixed(1)}</Label>
          <Slider
            defaultValue={[Math.min(0.8, maxStyleStrength)]}
            max={maxStyleStrength}
            step={0.1}
            value={[styleStrength]}
            onValueChange={handleStrengthChange}
          />
        </div>
      </div>
    </Card>
  );
} 