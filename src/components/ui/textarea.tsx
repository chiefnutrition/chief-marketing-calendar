import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-24 w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm text-ink",
        "placeholder:text-subtle",
        "transition-[border-color,box-shadow] duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:border-accent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
