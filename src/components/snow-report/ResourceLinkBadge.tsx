import { BadgeType } from "./ResortInfoLinksMeta";

export default function Badge({ text }: { text: BadgeType }) {
  return (
    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
      {text}
    </span>
  );
}
