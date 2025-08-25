"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { button as Button } from "@/components/ui/button";
import { RefreshCcw, ArrowUpToLine } from "lucide-react";
import Image from "next/image";

export interface ImageVariant {
  url: string;
}

interface ImageVariantGridProps {
  variants: ImageVariant[];
  onSelect: (indices: number[]) => void;
  onUpscale: (index: number) => void;
  onRegenerate: (index: number) => void;
  loading?: boolean;
}

export function ImageVariantGrid({
  variants,
  onSelect,
  onUpscale,
  onRegenerate,
  loading = false,
}: ImageVariantGridProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const handleSelect = (index: number, checked: boolean) => {
    const newIndices = checked
      ? [...selectedIndices, index]
      : selectedIndices.filter((i: number) => i !== index);
    setSelectedIndices(newIndices);
    onSelect(newIndices);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {variants.map((variant, index) => (
        <div key={index} className="relative aspect-square">
          <div className="absolute inset-0">
            <Image
              src={variant.url}
              alt={`Generated image variant ${index + 1}`}
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="absolute top-2 left-2">
            <Checkbox
              checked={selectedIndices.includes(index)}
              onCheckedChange={(checked: boolean | "indeterminate") =>
                handleSelect(index, checked as boolean)
              }
            />
          </div>
          <div className="absolute top-2 right-2 space-x-1">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => onUpscale(index)}
              disabled={loading}
            >
              <ArrowUpToLine className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => onRegenerate(index)}
              disabled={loading}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
