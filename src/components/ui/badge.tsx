import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-medium tracking-wide",
  {
    variants: {
      variant: {
        edm: "bg-accent text-accent-fg",
        sms: "bg-clay text-clay-fg",
        event: "bg-event text-event-fg",
        au: "bg-surface-2 text-ink",
        us: "bg-surface-2 text-ink",
        both: "bg-surface-2 text-muted",
        draft: "bg-surface-2 text-muted",
        scheduled: "bg-accent/15 text-accent",
        sent: "bg-sent/20 text-accent",
        public: "bg-transparent text-muted",
        school: "bg-school text-ink",
        retail: "bg-transparent text-clay",
        cultural: "bg-transparent text-muted",
        sporting: "bg-transparent text-ink",
        mute: "bg-surface-2 text-muted",
      },
    },
    defaultVariants: { variant: "mute" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
