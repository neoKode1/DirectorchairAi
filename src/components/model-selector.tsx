import { AVAILABLE_ENDPOINTS, type ApiInfo } from "@/lib/fal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  category?: "video" | "image" | "music" | "voiceover" | "lipsync";
}

export function ModelSelector({
  selectedModel,
  onModelChange,
  category,
}: ModelSelectorProps) {
  // Filter endpoints based on category if provided
  const availableModels = category
    ? AVAILABLE_ENDPOINTS.filter((endpoint) => endpoint.category === category)
    : AVAILABLE_ENDPOINTS;

  return (
    <div className="w-full space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Model Selection
      </label>
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {availableModels.map((model) => (
            <SelectItem key={model.endpointId} value={model.endpointId}>
              <div className="flex flex-col">
                <span className="font-medium">{model.label}</span>
                <span className="text-xs text-gray-500">
                  {model.description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedModel && (
        <div className="text-xs text-gray-500">
          {
            availableModels.find((m) => m.endpointId === selectedModel)
              ?.description
          }
        </div>
      )}
    </div>
  );
}
