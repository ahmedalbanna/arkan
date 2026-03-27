import { cn } from "@/infrastructure/utils/cn"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-muted/40 transition-opacity duration-1000", className)}
      {...props}
    />
  )
}

export { Skeleton }
