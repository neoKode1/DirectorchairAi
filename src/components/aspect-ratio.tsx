'use client';

// AspectRatioSelector.tsx
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type AspectRatioOption = "16:9" | "9:16" | "4:3" | "3:4";

interface AspectRatioSelectorProps {
  className?: string;
  onValueChange?: (ratio: AspectRatioOption | null) => void;
  value: AspectRatioOption | null;
  disabled?: boolean;
}

const ASPECT_RATIOS: { value: AspectRatioOption; label: string; description: string }[] = [
  {
    value: "16:9",
    label: "Landscape (16:9)",
    description: "Best for cinematic videos and standard displays",
  },
  {
    value: "9:16",
    label: "Portrait (9:16)",
    description: "Perfect for mobile and social media stories",
  },
  {
    value: "4:3",
    label: "Standard (4:3)",
    description: "Classic standard display format",
  },
  {
    value: "3:4",
    label: "Portrait Standard (3:4)",
    description: "Vertical standard format",
  },
];

export function AspectRatioSelector({
  className,
  onValueChange,
  value,
  disabled = false,
}: AspectRatioSelectorProps) {
  const handleValueChange = (newValue: string) => {
    onValueChange?.(newValue as AspectRatioOption);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <Label className="text-sm font-medium">Aspect Ratio</Label>
      <RadioGroup
        value={value || undefined}
        onValueChange={handleValueChange}
        className="grid grid-cols-1 gap-2"
        disabled={disabled}
      >
        {ASPECT_RATIOS.map((ratio) => (
          <label
            key={ratio.value}
            className={cn(
              "flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent",
              value === ratio.value ? "border-primary" : "border-border",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <RadioGroupItem value={ratio.value} id={ratio.value} />
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{ratio.label}</p>
              <p className="text-sm text-muted-foreground">
                {ratio.description}
              </p>
            </div>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}
