'use client';

import { cn } from "@/infrastructure/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-sm",
  {
    variants: {
      variant: {
        GET: "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400",
        POST: "bg-primary/10 text-primary border-primary/20",
        PUT: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400",
        DELETE: "bg-destructive/10 text-destructive border-destructive/20",
      },
    },
    defaultVariants: {
      variant: "GET",
    },
  }
)

export interface ApiMethodBadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function ApiMethodBadge({ className, variant, ...props }: ApiMethodBadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {variant}
    </div>
  );
}

export { ApiMethodBadge };
