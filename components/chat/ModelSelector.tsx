"use client";

import { Model, useModelStore } from "@/store/modelStore";
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
 * This component is placed in the ChatPageHeader within the chat layout
 * This ensures it's truly shared across all chat routes
 * Models are loaded at the dashboard layout level via the ServerModelsLoader
 */
export function ModelSelector({ models }: { models: Model[] }) {
  const selectModel = useModelStore((state) => state.setSelectedModelId);
  const selectedModelId = useModelStore((state) => state.selectedModelId);
  const hydrated = useModelStore((state) => state.hydrated);

  // Find the currently selected model
  const selectedModel = models.find((model) => model.id === selectedModelId);
  const displayName = selectedModel?.name || "Select model...";

  // If loading or no models available, show a disabled button
  if (models.length === 0 || !hydrated) {
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
        {models.map((model) => (
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
