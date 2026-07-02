import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { clsx } from "clsx";
import { CalendarDays, UserCircle2 } from "lucide-react";
import { formatDueDate } from "@/lib/date";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import type { Card as CardType } from "@/types";

interface CardProps {
  card: CardType;
  onClick: () => void;
}

export function Card({ card, onClick }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card", card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={clsx(
        "cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-card transition-shadow active:cursor-grabbing",
        "hover:shadow-card-hover",
        isDragging && "opacity-40"
      )}
    >
      <p className="text-sm font-medium text-slate-900">{card.title}</p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <PriorityBadge priority={card.priority} />

        {card.dueDate && (
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDueDate(card.dueDate)}
          </span>
        )}
      </div>

      {card.assignee && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <UserCircle2 className="h-4 w-4" />
          {card.assignee.name}
        </div>
      )}
    </div>
  );
}
