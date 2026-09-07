import { cn } from "@/lib/utils";

export function Wordmark({
  className,
  subtitle = "Marketing calendar",
  size = "sm",
}: {
  className?: string;
  subtitle?: string;
  size?: "sm" | "lg";
}) {
  return (
    <div className={cn("select-none", className)}>
      <img
        src="/chief-logo.png"
        alt="Chief"
        className={cn("block w-auto", size === "lg" ? "h-11" : "h-7")}
      />
      {subtitle ? (
        <p className="mt-1.5 text-[10px] font-medium tracking-[0.28em] text-muted uppercase">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
