import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, Clock } from "lucide-react";

interface ProductInfoAccordionProps {
  description?: string;
  specifications?: Record<string, string>;
  delivery?: string;
}

export function ProductInfoAccordion({
  description,
  specifications,
  delivery,
}: ProductInfoAccordionProps) {
  const hasContent = description || specifications || delivery;

  if (!hasContent) {
    return null;
  }

  return (
    <div className="border-t border-border/30 pt-6">
      <Accordion type="multiple" defaultValue={["description"]} className="w-full">
        {description && (
          <AccordionItem
            value="description"
            className="border-b border-border/30"
          >
            <AccordionTrigger className="py-4 text-sm font-semibold text-foreground hover:no-underline">
              Description
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </AccordionContent>
          </AccordionItem>
        )}

        {specifications && Object.keys(specifications).length > 0 && (
          <AccordionItem
            value="specifications"
            className="border-b border-border/30"
          >
            <AccordionTrigger className="py-4 text-sm font-semibold text-foreground hover:no-underline">
              Specifications
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <dl className="space-y-3">
                {Object.entries(specifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between py-2 border-b border-border/20 last:border-0"
                  >
                    <dt className="text-sm text-muted-foreground">
                      {key}
                    </dt>
                    <dd className="text-sm font-medium text-foreground">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </AccordionContent>
          </AccordionItem>
        )}

        {delivery && (
          <AccordionItem
            value="delivery"
            className="border-b border-border/30 last:border-0"
          >
            <AccordionTrigger className="py-4 text-sm font-semibold text-foreground hover:no-underline">
              Shipping & Delivery
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {delivery}
                </p>
                {/* Shipping Benefits */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">Free Shipping</p>
                      <p className="text-[10px] text-muted-foreground">Orders over £100</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                    <Clock className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">Fast Delivery</p>
                      <p className="text-[10px] text-muted-foreground">2-3 business days</p>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
}
