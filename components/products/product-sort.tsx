"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { startTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

interface ProductSortProps {
  currentSort: string;
}

export function ProductSort({ currentSort }: ProductSortProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    // INSTANT update with startTransition
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger
          id="sort"
          className="w-full sm:w-[180px] h-10 border-border/50 bg-card text-foreground text-sm font-medium focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
          aria-label="Sort Products"
        >
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Sort" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          <SelectItem value="newest" className="text-sm">Newest First</SelectItem>
          <SelectItem value="oldest" className="text-sm">Oldest First</SelectItem>
          <SelectItem value="price-low" className="text-sm">Price: Low to High</SelectItem>
          <SelectItem value="price-high" className="text-sm">Price: High to Low</SelectItem>
          <SelectItem value="name-asc" className="text-sm">Name: A to Z</SelectItem>
          <SelectItem value="name-desc" className="text-sm">Name: Z to A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
