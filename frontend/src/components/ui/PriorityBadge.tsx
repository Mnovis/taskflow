import { clsx } from "clsx";
import type { Priority } from "@/types";

const config: Record<Priority, { label: string; className: string }> = {
  LOW: { label: "Baixa", className: "bg-green-100 text-green-700" },
  MEDIUM: { label: "Média", className: "bg-amber-100 text-amber-700" },
  HIGH: { label: "Alta", className: "bg-red-100 text-red-700" },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { label, className } = config[priority];
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        className
      )}
    >
      {label}
    </span>
  );
}
