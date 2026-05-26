import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({ value, max = 3, size = 20 }: { value: number; max?: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          width={size}
          height={size}
          className={cn(
            "transition",
            i < value ? "fill-sunshine text-sunshine" : "text-muted-foreground/40",
          )}
        />
      ))}
    </div>
  );
}
