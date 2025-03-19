"use client";

import { cn } from "@/lib/utils";
import {
  Model,
  useModelActions,
  useModelHydrated,
  useSelectedModelId,
} from "@/store/modelStore";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ModelHoverCard } from "./ModelHoverCard";

/**
 * ModelSelector component for selecting AI models
 * Uses shadcn UI dropdown-menu for a clean, accessible interface
 * Models are provided as a prop from the server parent component
 */
export function ModelSelector({ models }: { models: Model[] }) {
  const { setSelectedModelId } = useModelActions();
  const selectedModelId = useSelectedModelId();
  const hydrated = useModelHydrated();

  // Find the currently selected model
  const selectedModel = models.find((model) => model.id === selectedModelId);
  const displayName = selectedModel?.name || "Select model...";

  // If loading or no models available, show a disabled button
  if (models.length === 0 || !hydrated) {
    return (
      <Button
        variant="outline"
        className="bg-background/50 border-muted-foreground/20 w-[220px] justify-between shadow-sm backdrop-blur-sm transition-all"
        disabled
      >
        <span className="text-muted-foreground/70 truncate font-medium">
          Loading models...
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-30" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-background/50 border-muted-foreground/20 hover:bg-accent/50 hover:border-accent w-[220px] justify-between shadow-sm backdrop-blur-sm transition-all duration-200"
        >
          <span className="truncate font-medium">{displayName}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-background/90 border-muted-foreground/20 animate-in fade-in-80 zoom-in-95 w-[220px] overflow-hidden shadow-lg backdrop-blur-lg"
        align="start"
        sideOffset={4}
      >
        {models.map((model) => (
          <ModelHoverCard key={model.id} model={model}>
            <DropdownMenuItem
              onClick={() => setSelectedModelId(model.id)}
              className={cn(
                "flex cursor-pointer items-center justify-between px-3 py-2.5 transition-colors duration-150",
                "hover:bg-accent/70 focus:bg-accent/70",
                selectedModelId === model.id && "bg-accent/30",
              )}
              // Using onSelect={()=>{}} to prevent menu from closing on hover
              onSelect={(e) => e.preventDefault()}
            >
              <span
                className={cn(
                  "truncate",
                  selectedModelId === model.id && "font-medium",
                )}
              >
                {model.name}
              </span>
              {selectedModelId === model.id && (
                <Check className="text-primary animate-in fade-in-50 ml-2 h-4 w-4 duration-100" />
              )}
            </DropdownMenuItem>
          </ModelHoverCard>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
