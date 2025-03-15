"use client";

import { useModelStore } from "@/store/modelStore";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

/**
 * ModelSelector component for selecting AI models
 * Uses shadcn UI dropdown-menu for a clean, accessible interface
 * Models are now loaded at the layout level via the ModelsProvider
 */
export function ModelSelector() {
  const models = useModelStore((state) => state.models);
  const selectModel = useModelStore((state) => state.setSelectedModelId);
  const selectedModelId = useModelStore((state) => state.selectedModelId);
  const isLoading = useModelStore((state) => state.isLoading);

  // Ensure models is always an array
  const safeModels = Array.isArray(models) ? models : [];

  // Find the currently selected model
  const selectedModel = safeModels.find(
    (model) => model.id === selectedModelId,
  );
  const displayName = selectedModel?.name || "Select model...";

  // If loading or no models available, show a disabled button
  if (isLoading || safeModels.length === 0) {
    return (
      <Button variant="outline" className="w-[200px] justify-between" disabled>
        <span className="truncate">Loading models...</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-between">
          <span className="truncate">{displayName}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        {safeModels.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => selectModel(model.id)}
            className="flex items-center justify-between"
          >
            <span className="truncate">{model.name}</span>
            {selectedModelId === model.id && <Check className="ml-2 h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
