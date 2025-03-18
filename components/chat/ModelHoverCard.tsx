import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Model } from "@/store/modelStore";
import { ReactNode } from "react";

/**
 * ModelHoverCard - Displays detailed model information on hover
 *
 * @param model - The model object containing details to display
 * @param children - The trigger element that activates the hover card
 */
export function ModelHoverCard({
  model,
  children,
}: {
  model: Model;
  children: ReactNode;
}) {
  // Format price to show in dollars with appropriate decimal places
  // Handle both string and number types since Neon returns numeric as string
  const formatPrice = (price: string | number | null) => {
    if (price === null) return "N/A";
    // Convert string to number if needed
    const numericPrice = typeof price === "string" ? parseFloat(price) : price;
    return `$${numericPrice.toFixed(2)}`;
  };

  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-96 p-4" side="left" align="start">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">{model.name}</h4>

          {model.description && (
            <p className="text-muted-foreground text-sm">{model.description}</p>
          )}

          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="col-span-1 flex flex-col">
              <span className="font-medium">Context</span>
              <span className="text-muted-foreground">
                {model.contextWindow
                  ? `${model.contextWindow.toLocaleString()} tokens`
                  : "N/A"}
              </span>
            </div>

            <div className="col-span-1 flex flex-col">
              <span className="font-medium">Input Price</span>
              <span className="text-muted-foreground">
                {formatPrice(model.inputPricePerToken)} / M tokens
              </span>
            </div>

            <div className="col-span-1 flex flex-col">
              <span className="font-medium">Output Price</span>
              <span className="text-muted-foreground">
                {formatPrice(model.outputPricePerToken)} / M tokens
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
