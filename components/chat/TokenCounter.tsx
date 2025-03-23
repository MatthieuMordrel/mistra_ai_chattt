"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsCalculatingTokens, useTokenCount } from "@/store/chatStore";
import { Loader2 } from "lucide-react";

interface TokenCounterProps {
  className?: string;
}

export default function TokenCounter({ className = "" }: TokenCounterProps) {
  const tokenCount = useTokenCount();
  const isCalculatingTokens = useIsCalculatingTokens();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`text-muted-foreground flex items-center text-sm ${className}`}
          >
            <span className="mr-1">Tokens:</span>
            {isCalculatingTokens ? (
              <div className="flex items-center">
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                <span>calculating...</span>
              </div>
            ) : (
              <span className="font-mono">{tokenCount.toLocaleString()}</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Estimated token count</p>
          <p className="mt-1 text-xs">
            Values are approximate and may differ from exact Mistral
            tokenization
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
