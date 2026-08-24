import type * as React from "react";

import { cn } from "@/lib/utils";

function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-hairline bg-midnight/60 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
