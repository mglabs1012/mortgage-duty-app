import { BookOpenText, ClipboardCheck, CreditCard, Factory, Layers, type LucideIcon } from "lucide-react";

type CoverStyle = { gradient: string; icon: LucideIcon };

const COVERS: Record<string, CoverStyle> = {
  Guide: { gradient: "from-brand-500 via-brand-700 to-brand-950", icon: BookOpenText },
  MSME: { gradient: "from-emerald-500 via-teal-700 to-slate-900", icon: Factory },
  "How-To": { gradient: "from-sky-500 via-blue-700 to-slate-900", icon: CreditCard },
  Checklist: { gradient: "from-amber-500 via-orange-600 to-rose-900", icon: ClipboardCheck },
  "Further Charge": { gradient: "from-violet-500 via-indigo-700 to-slate-900", icon: Layers },
};
const FALLBACK: CoverStyle = COVERS.Guide;

function coverFor(tag: string): CoverStyle {
  return COVERS[tag] ?? FALLBACK;
}

/**
 * Generated, asset-free cover art for a post: tag gradient, dot grid,
 * soft glow, and a large tilted icon that drifts on card hover.
 */
export function PostCover({
  tag,
  className = "",
  size = "md",
}: {
  tag: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const { gradient, icon: Icon } = coverFor(tag);
  const iconSize = size === "lg" ? "h-40 w-40" : size === "sm" ? "h-16 w-16" : "h-24 w-24";

  return (
    <div aria-hidden className={`relative overflow-hidden bg-gradient-to-br ${gradient} ${className}`}>
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "18px 18px",
          maskImage: "linear-gradient(135deg, black 10%, transparent 75%)",
          WebkitMaskImage: "linear-gradient(135deg, black 10%, transparent 75%)",
        }}
      />
      <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/25 blur-3xl" />
      <Icon
        strokeWidth={1.25}
        className={`absolute -bottom-4 -right-3 ${iconSize} rotate-[-12deg] text-white/25 transition-transform duration-700 ease-out group-hover:-translate-y-2 group-hover:rotate-[-4deg] group-hover:scale-110`}
      />
    </div>
  );
}
