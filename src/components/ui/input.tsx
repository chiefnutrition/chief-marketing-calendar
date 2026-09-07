import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink shadow-none",
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

export { Input };
