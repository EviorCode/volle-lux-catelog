"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, SlidersHorizontal, ChevronDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  useMemo,
  useCallback,
  useState,
  useEffect,
  startTransition,
} from "react";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroup {
  name: string;
  key: string;
  options: FilterOption[];
}

const baseFilters: FilterGroup[] = [
  {
    name: "Category",
    key: "category",
    options: [
      { value: "boxes", label: "Boxes" },
      { value: "bubble-wrap", label: "Bubble Wrap" },
      { value: "packing-tape", label: "Packing Tape" },
      { value: "envelopes", label: "Envelopes" },
      { value: "containers", label: "Containers" },
    ],
  },

  {
    name: "Material",
    key: "material",
    options: [
      { value: "cardboard", label: "Cardboard" },
      { value: "plastic", label: "Plastic" },
      { value: "paper", label: "Paper" },
      { value: "foam", label: "Foam" },
      { value: "metal", label: "Metal" },
    ],
  },
];

type CategoryOption = { value: string; label: string };

function FilterContent({
  categories,
  onClose,
}: {
  categories?: CategoryOption[];
  onClose?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [localPriceRange, setLocalPriceRange] = useState([0, 1000]);
  const [optimisticFilters, setOptimisticFilters] = useState<
    Record<string, string[]>
  >({});

  const filters: FilterGroup[] = useMemo(() => {
    if (categories && categories.length > 0) {
      return [
        { name: "Category", key: "category", options: categories },
        ...baseFilters.filter((f) => f.key !== "category"),
      ];
    }
    return baseFilters;
  }, [categories]);

  const activeFilters = useMemo(() => {
    const filters: Record<string, string[]> = {};
    searchParams.forEach((value, key) => {
      if (
        key !== "sort" &&
        key !== "search" &&
        key !== "priceMin" &&
        key !== "priceMax"
      ) {
        filters[key] = value.split(",");
      }
    });
    return filters;
  }, [searchParams]);

  const priceRange = useMemo(() => {
    return {
      min: parseInt(searchParams.get("priceMin") || "0"),
      max: parseInt(searchParams.get("priceMax") || "1000"),
    };
  }, [searchParams]);

  useEffect(() => {
    const min = priceRange.min;
    const max = priceRange.max;
    if (localPriceRange[0] !== min || localPriceRange[1] !== max) {
      setLocalPriceRange([min, max]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceRange.min, priceRange.max]);

  const updateFilters = useCallback(
    (key: string, value: string, checked: boolean) => {
      setOptimisticFilters((prev) => {
        const newFilters = { ...prev };
        const currentValues = newFilters[key] || activeFilters[key] || [];
        const newValues = [...currentValues];

        if (checked) {
          if (!newValues.includes(value)) newValues.push(value);
        } else {
          const index = newValues.indexOf(value);
          if (index > -1) newValues.splice(index, 1);
        }

        if (newValues.length > 0) {
          newFilters[key] = newValues;
        } else {
          delete newFilters[key];
        }

        return newFilters;
      });

      const params = new URLSearchParams(searchParams.toString());
      const currentValues = params.get(key)?.split(",").filter(Boolean) || [];
      const newValues = [...currentValues];

      if (checked) {
        if (!newValues.includes(value)) newValues.push(value);
      } else {
        const index = newValues.indexOf(value);
        if (index > -1) newValues.splice(index, 1);
      }

      if (newValues.length > 0) params.set(key, newValues.join(","));
      else params.delete(key);

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, pathname, router, activeFilters]
  );

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams();
    const sort = searchParams.get("sort");
    const search = searchParams.get("search");
    if (sort) params.set("sort", sort);
    if (search) params.set("search", search);
    setLocalPriceRange([0, 1000]);
    setOptimisticFilters({});
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
    onClose?.();
  }, [searchParams, pathname, router, onClose]);

  useEffect(() => {
    setOptimisticFilters({});
  }, [searchParams]);

  const hasActiveFilters =
    Object.keys(activeFilters).length > 0 ||
    priceRange.min > 0 ||
    priceRange.max < 1000;

  const activeCategoryParam = searchParams.get("category");
  const activeCategoryName = activeCategoryParam
    ? activeCategoryParam
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Filters
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-auto px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Active Category Chip */}
      {activeCategoryName && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
              Category
            </p>
            <p className="text-sm font-semibold text-foreground truncate">
              {activeCategoryName}
            </p>
          </div>
          <button
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("category");
              startTransition(() => {
                router.replace(`/products?${params.toString()}`, {
                  scroll: false,
                });
              });
            }}
            className="shrink-0 w-6 h-6 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title="Clear category"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Filter Accordions */}
      <Accordion
        type="multiple"
        defaultValue={filters.map((f) => f.key)}
        className="w-full space-y-2"
      >
        {filters.map((filter) => (
          <AccordionItem
            key={filter.key}
            value={filter.key}
            className="border border-border/50 rounded-lg px-4 bg-card data-[state=open]:bg-secondary/30"
          >
            <AccordionTrigger className="py-3 text-sm font-medium text-foreground hover:no-underline [&[data-state=open]>svg]:rotate-180">
              <div className="flex items-center gap-2">
                <span>{filter.name}</span>
                {activeFilters[filter.key] &&
                  activeFilters[filter.key].length > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1.5">
                      {activeFilters[filter.key].length}
                    </span>
                  )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 pt-1">
              <div className="space-y-2.5">
                {filter.options.map((option) => {
                  const isChecked =
                    optimisticFilters[filter.key]?.includes(option.value) ||
                    activeFilters[filter.key]?.includes(option.value) ||
                    false;
                  return (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 cursor-pointer group py-1"
                    >
                      <Checkbox
                        id={`${filter.key}-${option.value}`}
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          updateFilters(
                            filter.key,
                            option.value,
                            checked as boolean
                          )
                        }
                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <span className="flex-1 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export function ProductFilters({
  categories,
}: {
  categories?: CategoryOption[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between border-border bg-card text-sm font-medium text-foreground hover:bg-secondary"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-full overflow-y-auto sm:max-w-sm bg-background"
          >
            <SheetHeader className="mb-6 pb-4 border-b border-border">
              <SheetTitle className="text-left text-lg font-semibold text-foreground">
                Filter Products
              </SheetTitle>
            </SheetHeader>
            <FilterContent
              categories={categories}
              onClose={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters */}
      <aside className="sticky top-24 hidden h-fit lg:block">
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <FilterContent categories={categories} />
        </div>
      </aside>
    </>
  );
}
